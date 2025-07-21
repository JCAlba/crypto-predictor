const Footer = () => {
    return (
      <footer className="bg-card border-t border-neon text-gray-400 text-sm text-center py-4 mt-12">
        <p>
          &copy; {new Date().getFullYear()} CryptoPredict. All rights reserved. No financial advice.
        </p>
      </footer>
    );
  };
  
  export default Footer;
  