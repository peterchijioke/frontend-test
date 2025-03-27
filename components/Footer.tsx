const Footer = () => {
  return (
    <footer className="w-full p-4 bg-primary text-white text-center mt-auto">
      <p className="text-sm md:text-base">
        &copy; {new Date().getFullYear()} WakaFarm. Connecting Naija farmers and
        buyers.
      </p>
    </footer>
  );
};

export default Footer;
