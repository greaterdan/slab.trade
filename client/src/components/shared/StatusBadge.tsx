import { Badge } from "@/components/ui/badge";
import { MarketStatus } from "@shared/schema";
import { motion } from "framer-motion";

interface StatusBadgeProps {
  status: MarketStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "bonding":
        return {
          label: "Bonding",
          className: "bg-solana-purple/10 text-solana-purple border-solana-purple/30",
        };
      case "warmup":
        return {
          label: "Warmup",
          className: "bg-solana-aqua/10 text-solana-aqua border-solana-aqua/30",
        };
      case "perps":
        return {
          label: "Perps Live",
          className: "bg-solana-mint/10 text-solana-mint border-solana-mint/30",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${className} font-medium text-xs uppercase tracking-wide`}
      data-testid={`badge-status-${status}`}
    >
      <motion.div
        className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {config.label}
    </Badge>
  );
}
