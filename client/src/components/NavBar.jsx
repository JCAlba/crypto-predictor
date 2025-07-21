const NavBar = () => {
    return (
      <nav className="bg-card shadow-md border-b border-neon px-6 py-4 flex justify-between items-center text-white">
        <h1 className="text-neon text-xl font-bold">CryptoPredict</h1>
        <a
          href="#donate"
          className="text-sm border border-neon px-3 py-1 rounded hover:bg-neon/10 transition"
        >
          Donate
        </a>
      </nav>
    );
  };
  
  export default NavBar;
  