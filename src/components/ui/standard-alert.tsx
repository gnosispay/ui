import { AlertCircle, TriangleAlert, Info } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "./alert";

interface StandardAlertProps extends Omit<React.ComponentProps<"div">, 'children'> {
  title?: string;
  description: string | React.ReactNode;
  variant?: "default" | "destructive" | "warning" | "info";
  customIcon?: React.ReactNode;
}

const getDefaultIcon = (variant: StandardAlertProps['variant']) => {
  switch (variant) {
    case "destructive":
      return <AlertCircle className="h-4 w-4" />;
    case "warning":
      return <TriangleAlert className="h-4 w-4" />;
    case "info":
      return <Info className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

export const StandardAlert = ({ 
  title, 
  description, 
  variant = "default", 
  customIcon,
  className,
  ...props 
}: StandardAlertProps) => {
  const icon = customIcon ?? getDefaultIcon(variant);

  return (
    <Alert variant={variant} className={className} {...props}>
      {icon}
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}; 