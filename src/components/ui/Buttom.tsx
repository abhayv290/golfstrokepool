
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    className?: string;
    variant?: "primary" | "secondary" | "ghost";
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
        "bg-foreground text-background hover:opacity-90 focus-visible:ring-foreground",
    secondary:
        "bg-transparent text-foreground border border-foreground/25 hover:bg-foreground/10 focus-visible:ring-foreground",
    ghost:
        "bg-transparent text-foreground hover:bg-foreground/10 focus-visible:ring-foreground",
};

export function Button({
    children,
    className,
    type = "button",
    variant = "primary",
    ...props
}: ButtonProps) {
    const baseStyles =
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <button
            type={type}
            className={`${baseStyles} ${variantStyles[variant]} ${className ?? ""}`.trim()}
            {...props}
        >
            {children}
        </button>
    );
}


export function LoadingSwap({
    children,
    className,
    isLoading = true,
}: {
    children: ReactNode;
    className?: string;
    isLoading?: boolean;
}) {
    if (isLoading) {
        return (
            <div
                className={`w-full flex items-center justify-center ${className ?? ""}`.trim()}
            >
                <span
                    className="h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin"
                    aria-hidden="true"
                />
            </div>
        );
    }

    return <>{children}</>;
}