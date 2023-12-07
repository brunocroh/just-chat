import { Slot } from "@radix-ui/react-slot";
import { twMerge } from "tailwind-merge";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const Button = ({
  asChild = false,
  className,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={twMerge(
        "bg-primary rounded-2xl p-2 text-primary-foreground shadow hover:bg-primary/90",
        className,
      )}
      {...props}
    />
  );
};

Button.displayName = "Button";
