import QRCodeGenerator from "@/components/qr-code-generator.tsx";


export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
        <QRCodeGenerator />
    </div>
  );
}
