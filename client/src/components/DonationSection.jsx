import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";
import { Copy } from "lucide-react"; // or any other icon lib you use

const QrCard = ({ address, label, uriPrefix }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card border border-neon p-4 rounded-lg shadow-neon transition-transform duration-200 hover:scale-105 text-center w-72 relative">
      <h3 className="text-lg font-semibold text-neon mb-3">{label}</h3>
      <div className="flex justify-center mb-3">
        <QRCodeCanvas value={`${uriPrefix}:${address}`} size={128} />
      </div>
      <div className="flex justify-center items-center gap-2 text-xs break-words text-gray-300">
        <span className="break-all">{address}</span>
        <button
          onClick={handleCopy}
          className="text-neon hover:text-white transition"
          title="Copy address"
        >
          <Copy size={14} />
        </button>
      </div>
      {copied && (
        <div className="absolute top-2 right-2 text-xs text-green-400 bg-gray-800 px-2 py-1 rounded">
          Copied!
        </div>
      )}
    </div>
  );
};

const DonationSection = () => {
  const btcAddress = "bc1qg4p4ut6emgd3gkjs6xxn0kp6hakvdeged6pw9w";
  const ethAddress = "0x8B5E7a7A10b5143b15B9De1B2dfe225F0C8F827b";

  return (
    <div id="donate" className="mt-16 text-center">
      <h2 className="text-2xl font-bold text-neon mb-4">Support the Project</h2>
      <p className="mb-6 text-gray-400">
        Donations help us improve and maintain the platform!
      </p>
      <div className="flex flex-col md:flex-row justify-center gap-8">
        <QrCard address={btcAddress} label="Bitcoin (BTC)" uriPrefix="bitcoin" />
        <QrCard address={ethAddress} label="Ethereum (ETH)" uriPrefix="ethereum" />
      </div>
    </div>
  );
};

export default DonationSection;
