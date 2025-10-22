import { useState, useEffect, useRef } from "react";
import { PublicKey, Keypair, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Check, Rocket, Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MarketTile } from "@/components/shared/MarketTile";
import type { LaunchFormData, BondingCurveType } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import * as percolator from "@/percolator";
import type { RiskParams, InstrumentConfig } from "@/percolator/types";
import { 
  MeteoraBondingClient, 
  createSlabBondingConfig, 
  createBondingCurvePool,
  buyBondingCurveTokens,
  SLAB_TAX_DESTINATION 
} from "@/lib/meteoraBonding";
import { createWalletSigningService } from "@/lib/walletSigning";

const steps = [
  { number: 1, title: "Basics", subtitle: "Name, symbol, description" },
  { number: 2, title: "Social", subtitle: "Links and branding" },
  { number: 3, title: "Deploy", subtitle: "Launch your slab" },
];

export default function Launch() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    step: 1,
    basics: { 
      name: "", 
      symbol: "", 
      description: "",
      imageUrl: "",
      imageFile: null as File | null
    },
    social: {
      website: "",
      twitter: "",
      telegram: ""
    },
    deployment: {
      creatorSolAmount: 0.1
    }
  });

  // Show authentication required message
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <Rocket className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-mono mb-2 text-foreground">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to launch new markets.
          </p>
          <Button 
            onClick={() => window.location.href = "/api/login"}
            className="w-full"
            data-testid="button-login-launch"
          >
            Log In to Continue
          </Button>
        </Card>
      </div>
    );
  }

  const updateFormData = (section: keyof LaunchFormData, data: any) => {
    setFormData(prev => ({ 
      ...prev, 
      [section]: { ...(prev[section] as object), ...data } 
    }));
  };

  const canProceed = () => {
    if (currentStep === 1) return formData.basics.name && formData.basics.symbol && formData.basics.description;
    if (currentStep === 2) return true; // Social links are optional
    return true;
  };

  // Image handling functions
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (PNG, JPG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      updateFormData("basics", { 
        imageFile: file,
        imageUrl: result // Use data URL for preview
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    updateFormData("basics", { 
      imageFile: null,
      imageUrl: ""
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async () => {
    if (!formData.basics.imageFile) return;

    setIsUploading(true);
    try {
      // TODO: Implement actual image upload to IPFS or cloud storage
      // For now, simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockUrl = `https://slab-images.com/${Date.now()}.jpg`;
      updateFormData("basics", { imageUrl: mockUrl });
      
      toast({
        title: "Image Uploaded",
        description: "Your image has been uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deployMarket = async () => {
    if (!user?.wallet?.publicKey) {
      toast({
        title: "Wallet Not Found",
        description: "Please ensure you have a wallet connected",
        variant: "destructive",
      });
      return;
    }

    setIsDeploying(true);

    try {
      // Initialize Solana connection
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const userPublicKey = new PublicKey(user.wallet.publicKey);
      
      // Create wallet signing service
      const walletSigningService = createWalletSigningService(connection, userPublicKey);
      const wallet = walletSigningService.createWallet();

      toast({
        title: "Creating Bonding Curve Configuration...",
        description: "Setting up Meteora DBC parameters",
      });

      // Step 1: Create token mint
      const tokenMint = Keypair.generate();
      const quoteMint = new PublicKey("So11111111111111111111111111111111111111112"); // SOL

      // Step 2: Create bonding curve configuration
      const configTx = await createSlabBondingConfig(
        connection,
        wallet,
        tokenMint.publicKey,
        quoteMint
      );

      toast({
        title: "Configuration Created",
        description: "Creating virtual pool for bonding curve",
      });

      // Step 3: Create virtual pool with initial liquidity
      const initialLiquidity = formData.deployment.creatorSolAmount * LAMPORTS_PER_SOL;
      const poolTx = await createBondingCurvePool(
        connection,
        wallet,
        new PublicKey(configTx), // Config address from previous step
        tokenMint.publicKey,
        initialLiquidity
      );

      toast({
        title: "Pool Created",
        description: "Adding initial liquidity to bonding curve",
      });

      // Step 4: Add initial liquidity (buy tokens with creator's SOL)
      const buyTx = await buyBondingCurveTokens(
        connection,
        wallet,
        new PublicKey(poolTx), // Pool address from previous step
        initialLiquidity,
        0 // No minimum token amount
      );

      // Step 5: Store market data in our database
      const marketData = {
        name: formData.basics.name,
        symbol: formData.basics.symbol,
        description: formData.basics.description,
        imageUrl: formData.basics.imageUrl,
        website: formData.social.website,
        twitter: formData.social.twitter,
        telegram: formData.social.telegram,
        creator: user.wallet.publicKey,
        tokenMint: tokenMint.publicKey.toBase58(),
        poolAddress: poolTx,
        configAddress: configTx,
        initialSol: formData.deployment.creatorSolAmount,
        graduationThreshold: 80, // 80 SOL
        taxDestination: SLAB_TAX_DESTINATION.toBase58(),
        createdAt: new Date().toISOString(),
        status: "active"
      };

      // TODO: Store marketData in database
      console.log("Market created:", marketData);

      toast({
        title: "✅ Slab Created Successfully!",
        description: `Your ${formData.basics.symbol} bonding curve is now live with ${formData.deployment.creatorSolAmount} SOL initial liquidity`,
      });

    } catch (error) {
      console.error("Slab deployment failed:", error);
      toast({
        title: "Deployment Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to launch a market. Redirecting to login...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  // Show nothing while checking auth or redirecting
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="text-lg text-muted-foreground">Checking authentication...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Launch Slab
        </h1>
        <p className="text-muted-foreground">
          Create perpetual market with custom bonding curve
        </p>
      </motion.div>

      {/* Stepper */}
      <Card className="p-6 border-card-border bg-card">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
                    currentStep === step.number
                      ? "bg-primary border-primary text-primary-foreground glow-mint"
                      : currentStep > step.number
                      ? "bg-success border-success text-black"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  data-testid={`step-${step.number}`}
                >
                  {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                </motion.div>
                <div className="text-center mt-2 hidden sm:block">
                  <div className="text-xs font-semibold">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.subtitle}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 transition-all ${currentStep > step.number ? "bg-success" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form - 2 cols */}
        <div className="lg:col-span-2">
          <Card className="p-6 border-card-border bg-card min-h-[500px]">
            <AnimatePresence mode="wait">
              {/* Step 1: Basics */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2 text-foreground">Slab Basics</h2>
                    <p className="text-sm text-muted-foreground">Set up your slab identity</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Slab Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Bonk Inu"
                        value={formData.basics.name}
                        onChange={(e) => updateFormData("basics", { name: e.target.value })}
                        className="mt-2"
                        data-testid="input-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="symbol">Symbol</Label>
                      <Input
                        id="symbol"
                        placeholder="e.g., BONK"
                        value={formData.basics.symbol}
                        onChange={(e) => updateFormData("basics", { symbol: e.target.value.toUpperCase() })}
                        className="mt-2"
                        maxLength={10}
                        data-testid="input-symbol"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        placeholder="Describe your slab..."
                        value={formData.basics.description}
                        onChange={(e) => updateFormData("basics", { description: e.target.value })}
                        className="mt-2 w-full px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        rows={3}
                        data-testid="input-description"
                      />
                    </div>

                    <div>
                      <Label>Slab Image (optional)</Label>
                      <div className="mt-2">
                        {imagePreview ? (
                          <div className="relative">
                            <div className="aspect-square w-full max-w-48 rounded-md border border-border overflow-hidden bg-muted/10">
                              <img 
                                src={imagePreview} 
                                alt="Slab preview" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={uploadImage}
                                disabled={isUploading}
                                className="flex-1"
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Image
                                  </>
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={removeImage}
                                className="px-3"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                              dragActive 
                                ? "border-primary bg-primary/5" 
                                : "border-border hover:border-primary/50"
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileInput}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="space-y-2">
                              <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground" />
                              <div className="text-sm">
                                <span className="text-primary font-medium">Click to upload</span> or drag and drop
                              </div>
                              <div className="text-xs text-muted-foreground">
                                PNG, JPG, GIF up to 5MB
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Social Media */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2 text-foreground">Social Links</h2>
                    <p className="text-sm text-muted-foreground">Add your social media links (optional)</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={formData.social.website}
                        onChange={(e) => updateFormData("social", { website: e.target.value })}
                        className="mt-2"
                        data-testid="input-website"
                      />
                    </div>

                    <div>
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        type="url"
                        placeholder="https://twitter.com/yourusername"
                        value={formData.social.twitter}
                        onChange={(e) => updateFormData("social", { twitter: e.target.value })}
                        className="mt-2"
                        data-testid="input-twitter"
                      />
                    </div>

                    <div>
                      <Label htmlFor="telegram">Telegram</Label>
                      <Input
                        id="telegram"
                        type="url"
                        placeholder="https://t.me/yourgroup"
                        value={formData.social.telegram}
                        onChange={(e) => updateFormData("social", { telegram: e.target.value })}
                        className="mt-2"
                        data-testid="input-telegram"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Deploy */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2 text-foreground">Deploy Your Slab</h2>
                    <p className="text-sm text-muted-foreground">Configure deployment settings and launch your bonding curve market</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="creator-sol">Initial SOL Amount</Label>
                      <div className="mt-2">
                        <div className="relative">
                          <Input
                            id="creator-sol"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={formData.deployment.creatorSolAmount}
                            onChange={(e) => updateFormData("deployment", { creatorSolAmount: parseFloat(e.target.value) })}
                            className="pr-16"
                            data-testid="input-creator-sol"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            SOL
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Amount of SOL you want to add as initial liquidity to your slab
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg text-foreground">Deployment Summary</h3>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Slab Name</span>
                          <span className="font-medium text-foreground">{formData.basics.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Symbol</span>
                          <span className="font-medium text-foreground">{formData.basics.symbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Initial SOL</span>
                          <span className="font-medium text-foreground">{formData.deployment.creatorSolAmount} SOL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Graduation Threshold</span>
                          <span className="font-medium text-success">80 SOL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bonding Curve</span>
                          <span className="font-medium text-foreground">Meteora DBC</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deployment Cost</span>
                          <span className="font-medium text-success">~0.01 SOL</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/10 border border-border rounded-md">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">Ready to Launch</h4>
                          <p className="text-sm text-muted-foreground">
                            Your slab will be created with Meteora's Dynamic Bonding Curve. 
                            Graduation happens automatically at 80 SOL total liquidity.
                          </p>
                          <div className="text-xs text-muted-foreground">
                            • 4% tax during bonding phase<br/>
                            • 1% tax after graduation<br/>
                            • All taxes go to SLAB treasury
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12"
                      size="lg"
                      onClick={deployMarket}
                      disabled={isDeploying}
                      data-testid="button-deploy"
                    >
                      {isDeploying ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Creating Slab...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-5 h-5 mr-2" />
                          Launch Slab
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                data-testid="button-prev-step"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </div>
              <Button
                onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
                disabled={currentStep === 3 || !canProceed()}
                data-testid="button-next-step"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Live Summary - 1 col */}
        <div>
          <Card className="p-6 border-card-border bg-card sticky top-24">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Live Preview</h3>

            {formData.basics.symbol ? (
              <div className="space-y-4">
                <div className="aspect-square w-full rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Slab preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-primary">{formData.basics.symbol.slice(0, 2)}</span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-lg text-foreground">{formData.basics.symbol}</h4>
                  <p className="text-sm text-muted-foreground">{formData.basics.name || "Your slab name"}</p>
                  {formData.basics.description && (
                    <p className="text-xs text-muted-foreground mt-1">{formData.basics.description}</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div>
                    <Badge variant="outline" className="mb-2">Bonding Curve</Badge>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex-1 h-1 bg-warning rounded" />
                      <span className="text-warning">Bonding Phase</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <div className="flex-1 h-1 bg-success rounded" />
                      <span className="text-success">Graduation at 80 SOL</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Initial SOL</span>
                      <span className="font-mono font-medium text-foreground">{formData.deployment.creatorSolAmount} SOL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Graduation</span>
                      <span className="font-mono font-medium text-success">80 SOL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax Rate</span>
                      <span className="font-mono font-medium text-foreground">4% → 1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deployment</span>
                      <span className="font-mono font-medium text-success">~0.01 SOL</span>
                    </div>
                  </div>

                  {(formData.social.website || formData.social.twitter || formData.social.telegram) && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">Social Links</div>
                        {formData.social.website && (
                          <div className="text-xs text-primary truncate">🌐 {formData.social.website}</div>
                        )}
                        {formData.social.twitter && (
                          <div className="text-xs text-primary truncate">🐦 {formData.social.twitter}</div>
                        )}
                        {formData.social.telegram && (
                          <div className="text-xs text-primary truncate">📱 {formData.social.telegram}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Fill in slab details to see preview
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

