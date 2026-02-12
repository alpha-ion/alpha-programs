import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Container } from "./container";

export function Footer() {
    const t = useTranslations("footer");
    return (
        <footer className="mt-20 border-t bg-muted/30">
            <Container>
                <div className="flex flex-col items-center justify-between gap-6 py-10 text-sm text-muted-foreground sm:flex-row">
                    <div className="text-center sm:text-left">
                        <p>
                            {t("builtBy")}{" "}
                            <Link
                                href="/"
                                className="font-medium text-foreground transition-colors hover:text-primary"
                            >
                                Alpha
                            </Link>
                        </p>
                        <p className="mt-2 text-xs">
                            © {new Date().getFullYear()} {t("rightsReserved")}
                        </p>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground/70">
                            {t("shortcuts")}
                        </p>
                        <div className="mt-2 flex items-center justify-center gap-3 sm:justify-end">
                            <kbd className="rounded-md border bg-background px-2 py-1 font-mono text-xs">
                                Ctrl + D
                            </kbd>
                            <span className="text-xs">{t("download")}</span>
                            <kbd className="rounded-md border bg-background px-2 py-1 font-mono text-xs">
                                Ctrl + C
                            </kbd>
                            <span className="text-xs">{t("copy")}</span>
                        </div>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
