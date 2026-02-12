import { QrCode } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "./container";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { Link } from "@/i18n/navigation";

export function Nav() {
    const t = useTranslations("nav");
    const currentLocale = useLocale();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
            <Container>
                <div className="flex h-16 items-center justify-between">
                    <Link
                        href="/"
                        className="group flex items-center gap-3 transition-opacity hover:opacity-90"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                            <QrCode className="h-5 w-5 text-primary" aria-hidden="true" />
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-base font-semibold tracking-tight">
                                {t("appTitle")}
                            </span>
                            <span className="hidden text-xs text-muted-foreground sm:block">
                                {t("poweredBy")}
                            </span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <LanguageToggle currentLocale={currentLocale} />
                        <ThemeToggle />
                    </div>
                </div>
            </Container>
        </header>
    );
}
