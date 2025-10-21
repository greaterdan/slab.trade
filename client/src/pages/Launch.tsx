import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Check, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MarketTile } from "@/components/shared/MarketTile";
import type { LaunchFormData, BondingCurveType } from "@shared/schema";

const steps = [
  { number: 1, title: "Basics", subtitle: "Name, symbol, image" },
  { number: 2, title: "Bonding Curve", subtitle: "Type, price, taxes" },
  { number: 3, title: "Graduation", subtitle: "Triggers for perps" },
  { number: 4, title: "Perps Params", subtitle: "Trading parameters" },
  { number: 5, title: "Fees & Deploy", subtitle: "Final review" },
];

export default function Launch() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<LaunchFormData>({
    step: 1,
    basics: { name: "", symbol: "", imageUrl: "" },
    bondingCurve: { curveType: "linear", startPrice: 0.001, creatorTax: 2, protocolTax: 1, seedVaultTax: 2 },
    graduationTriggers: { minLiquidity: 1000000, minHolders: 1000, minAgeHours: 72 },
    perpsParams: { tickSize: 0.0001, lotSize: 1, maxLeverage: 20, initialMargin: 5, maintenanceMargin: 2.5, priceBandBps: 1000, fundingK: 0.0001, warmupHours: 24, warmupShortLevCap: 1 },
    fees: { takerBps: 10, makerBps: -2, creatorFeePct: 30, referrerFeePct: 10 },
  });

  const updateFormData = (section: keyof LaunchFormData, data: any) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], ...data } }));
  };

  const canProceed = () => {
    if (currentStep === 1) return formData.basics.name && formData.basics.symbol;
    return true;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-solana-mint to-solana-purple bg-clip-text text-transparent">
          Launch Your Market
        </h1>
        <p className="text-muted-foreground">
          Create a perpetual market with custom bonding curve and parameters
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
                    <h2 className="text-2xl font-bold mb-2">Market Basics</h2>
                    <p className="text-sm text-muted-foreground">Set up your market identity</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Market Name</Label>
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
                      <Label htmlFor="image">Image URL (optional)</Label>
                      <Input
                        id="image"
                        type="url"
                        placeholder="https://..."
                        value={formData.basics.imageUrl}
                        onChange={(e) => updateFormData("basics", { imageUrl: e.target.value })}
                        className="mt-2"
                        data-testid="input-image"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Bonding Curve */}
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
                    <h2 className="text-2xl font-bold mb-2">Bonding Curve</h2>
                    <p className="text-sm text-muted-foreground">Configure price discovery mechanism</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="curve-type">Curve Type</Label>
                      <Select
                        value={formData.bondingCurve.curveType}
                        onValueChange={(v) => updateFormData("bondingCurve", { curveType: v as BondingCurveType })}
                      >
                        <SelectTrigger className="mt-2" data-testid="select-curve-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linear">Linear</SelectItem>
                          <SelectItem value="exponential">Exponential</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="start-price">Start Price ($)</Label>
                      <Input
                        id="start-price"
                        type="number"
                        step="0.000001"
                        value={formData.bondingCurve.startPrice}
                        onChange={(e) => updateFormData("bondingCurve", { startPrice: parseFloat(e.target.value) })}
                        className="mt-2"
                        data-testid="input-start-price"
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="creator-tax">Creator Tax (%)</Label>
                        <Input
                          id="creator-tax"
                          type="number"
                          value={formData.bondingCurve.creatorTax}
                          onChange={(e) => updateFormData("bondingCurve", { creatorTax: parseFloat(e.target.value) })}
                          className="mt-2"
                          data-testid="input-creator-tax"
                        />
                      </div>
                      <div>
                        <Label htmlFor="protocol-tax">Protocol Tax (%)</Label>
                        <Input
                          id="protocol-tax"
                          type="number"
                          value={formData.bondingCurve.protocolTax}
                          onChange={(e) => updateFormData("bondingCurve", { protocolTax: parseFloat(e.target.value) })}
                          className="mt-2"
                          data-testid="input-protocol-tax"
                        />
                      </div>
                      <div>
                        <Label htmlFor="seed-vault-tax">Seed Vault (%)</Label>
                        <Input
                          id="seed-vault-tax"
                          type="number"
                          value={formData.bondingCurve.seedVaultTax}
                          onChange={(e) => updateFormData("bondingCurve", { seedVaultTax: parseFloat(e.target.value) })}
                          className="mt-2"
                          data-testid="input-seed-vault-tax"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-muted/10 rounded-md border border-border">
                      <div className="text-sm font-medium mb-1">Total Tax: {(formData.bondingCurve.creatorTax + formData.bondingCurve.protocolTax + formData.bondingCurve.seedVaultTax).toFixed(2)}%</div>
                      <div className="text-xs text-muted-foreground">Applied to each bonding curve transaction</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Graduation Triggers */}
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
                    <h2 className="text-2xl font-bold mb-2">Graduation Triggers</h2>
                    <p className="text-sm text-muted-foreground">When to transition from bonding to perpetuals</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="min-liquidity">Minimum Liquidity ($)</Label>
                      <Input
                        id="min-liquidity"
                        type="number"
                        value={formData.graduationTriggers.minLiquidity}
                        onChange={(e) => updateFormData("graduationTriggers", { minLiquidity: parseFloat(e.target.value) })}
                        className="mt-2"
                        data-testid="input-min-liquidity"
                      />
                    </div>

                    <div>
                      <Label htmlFor="min-holders">Minimum Holders</Label>
                      <Input
                        id="min-holders"
                        type="number"
                        value={formData.graduationTriggers.minHolders}
                        onChange={(e) => updateFormData("graduationTriggers", { minHolders: parseInt(e.target.value) })}
                        className="mt-2"
                        data-testid="input-min-holders"
                      />
                    </div>

                    <div>
                      <Label htmlFor="min-age">Minimum Age (hours)</Label>
                      <Input
                        id="min-age"
                        type="number"
                        value={formData.graduationTriggers.minAgeHours}
                        onChange={(e) => updateFormData("graduationTriggers", { minAgeHours: parseFloat(e.target.value) })}
                        className="mt-2"
                        data-testid="input-min-age"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Perps Parameters */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Perpetuals Parameters</h2>
                    <p className="text-sm text-muted-foreground">Advanced trading configuration</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tick-size">Tick Size</Label>
                      <Input
                        id="tick-size"
                        type="number"
                        step="0.0001"
                        value={formData.perpsParams.tickSize}
                        onChange={(e) => updateFormData("perpsParams", { tickSize: parseFloat(e.target.value) })}
                        className="mt-2"
                        data-testid="input-tick-size"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lot-size">Lot Size</Label>
                      <Input
                        id="lot-size"
                        type="number"
                        value={formData.perpsParams.lotSize}
                        onChange={(e) => updateFormData("perpsParams", { lotSize: parseFloat(e.target.value) })}
                        className="mt-2"
                        data-testid="input-lot-size"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-leverage">Max Leverage</Label>
                      <Input
                        id="max-leverage"
                        type="number"
                        value={formData.perpsParams.maxLeverage}
                        onChange={(e) => updateFormData("perpsParams", { maxLeverage: parseInt(e.target.value) })}
                        className="mt-2"
                        data-testid="input-max-leverage"
                      />
                    </div>
                    <div>
                      <Label htmlFor="warmup-hours">Warmup Hours</Label>
                      <Input
                        id="warmup-hours"
                        type="number"
                        value={formData.perpsParams.warmupHours}
                        onChange={(e) => updateFormData("perpsParams", { warmupHours: parseFloat(e.target.value) })}
                        className="mt-2"
                        data-testid="input-warmup-hours"
                      />
                    </div>
                    <div>
                      <Label htmlFor="warmup-short-lev">Warmup Short Lev Cap</Label>
                      <Input
                        id="warmup-short-lev"
                        type="number"
                        value={formData.perpsParams.warmupShortLevCap}
                        onChange={(e) => updateFormData("perpsParams", { warmupShortLevCap: parseFloat(e.target.value) })}
                        className="mt-2"
                        data-testid="input-warmup-short-lev"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Fees & Deploy */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Fees & Final Review</h2>
                    <p className="text-sm text-muted-foreground">Trading fees and deployment</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="taker-bps">Taker Fee (bps)</Label>
                      <Input
                        id="taker-bps"
                        type="number"
                        value={formData.fees.takerBps}
                        onChange={(e) => updateFormData("fees", { takerBps: parseFloat(e.target.value) })}
                        className="mt-2"
                        data-testid="input-taker-bps"
                      />
                    </div>
                    <div>
                      <Label htmlFor="maker-bps">Maker Fee (bps)</Label>
                      <Input
                        id="maker-bps"
                        type="number"
                        value={formData.fees.makerBps}
                        onChange={(e) => updateFormData("fees", { makerBps: parseFloat(e.target.value) })}
                        className="mt-2"
                        data-testid="input-maker-bps"
                      />
                    </div>
                    <div>
                      <Label htmlFor="creator-fee">Creator Fee %</Label>
                      <Input
                        id="creator-fee"
                        type="number"
                        value={formData.fees.creatorFeePct}
                        onChange={(e) => updateFormData("fees", { creatorFeePct: parseFloat(e.target.value) })}
                        className="mt-2"
                        data-testid="input-creator-fee"
                      />
                    </div>
                    <div>
                      <Label htmlFor="referrer-fee">Referrer Fee %</Label>
                      <Input
                        id="referrer-fee"
                        type="number"
                        value={formData.fees.referrerFeePct}
                        onChange={(e) => updateFormData("fees", { referrerFeePct: parseFloat(e.target.value) })}
                        className="mt-2"
                        data-testid="input-referrer-fee"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md">
                    <h3 className="font-semibold text-destructive mb-2">⚠️ Ready to Deploy</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Review all parameters carefully. Deployment is irreversible and will require wallet signature.
                    </p>
                    <Button
                      className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
                      size="lg"
                      data-testid="button-deploy"
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      Deploy Market
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
                onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
                disabled={currentStep === 5 || !canProceed()}
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
            <h3 className="text-lg font-semibold mb-4">Live Preview</h3>

            {formData.basics.symbol ? (
              <div className="space-y-4">
                <div className="aspect-square w-full rounded-md bg-gradient-to-br from-solana-purple to-solana-mint flex items-center justify-center">
                  <span className="text-4xl font-bold text-black">{formData.basics.symbol.slice(0, 2)}</span>
                </div>

                <div>
                  <h4 className="font-bold text-lg">{formData.basics.symbol}</h4>
                  <p className="text-sm text-muted-foreground">{formData.basics.name || "Your market name"}</p>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div>
                    <Badge variant="outline" className="mb-2">Status Timeline</Badge>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex-1 h-1 bg-solana-purple rounded" />
                      <span className="text-solana-purple">Bonding</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <div className="flex-1 h-1 bg-solana-aqua rounded" />
                      <span className="text-solana-aqua">Warmup</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <div className="flex-1 h-1 bg-solana-mint rounded" />
                      <span className="text-solana-mint">Perps</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Price</span>
                      <span className="font-mono font-medium" data-numeric="true">${formData.bondingCurve.startPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Tax</span>
                      <span className="font-mono font-medium" data-numeric="true">
                        {(formData.bondingCurve.creatorTax + formData.bondingCurve.protocolTax + formData.bondingCurve.seedVaultTax).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Leverage</span>
                      <span className="font-mono font-medium" data-numeric="true">{formData.perpsParams.maxLeverage}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Deployment</span>
                      <span className="font-mono font-medium text-success" data-numeric="true">~0.05 SOL</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Fill in market details to see preview
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
