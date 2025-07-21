import { QRCodeCanvas } from "qrcode.react";

const DonationSection = () => {
  const btcAddress = "bc1qg4p4ut6emgd3gkjs6xxn0kp6hakvdeged6pw9w";
  const ethAddress = "0x8B5E7a7A10b5143b15B9De1B2dfe225F0C8F827b";

  const QrCard = ({ address, label, uriPrefix }) => (
    <div className="bg-card border border-neon p-4 rounded-lg shadow-neon transition-transform duration-200 hover:scale-105 text-center w-72">
      <h3 className="text-lg font-semibold text-neon mb-3">{label}</h3>
      <div className="flex justify-center mb-3">
        <QRCodeCanvas value={`${uriPrefix}:${address}`} size={128} />
      </div>
      <p className="text-xs break-words text-gray-300">{address}</p>
    </div>
  );

  return (
    <div className="mt-16 text-center">
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
