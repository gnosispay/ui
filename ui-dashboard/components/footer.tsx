const Footer = () => (
  <div className="px-4 sm:px-6 lg:px-8 py-5 w-full max-w-6xl mx-auto bg-gp-bg-subtle">
    <hr className="border-t border-gray-200 pb-5" />

    <footer className="flex justify-between">
      <div className="text-xs text-gp-text-lc flex gap-1.5">
        <span>© {new Date().getFullYear()} GnosisPay</span>

        <span>&middot;</span>

        <a href="https://legal.gnosispay.com/" target="_blank">
          Legal Docs
        </a>
      </div>
    </footer>
  </div>
);

export default Footer;
