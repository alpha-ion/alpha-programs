import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import React from "react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Nav />
            {children}
            <Footer />
        </div>
    )
}