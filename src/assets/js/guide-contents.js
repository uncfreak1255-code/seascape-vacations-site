// The article and anchor navigation are complete without this reading marker.
(function () {
  if (!("IntersectionObserver" in window)) return;
  const links = Array.from(document.querySelectorAll(".wl-contents a"));
  const observer = new IntersectionObserver(function (entries) {
    entries.filter(function (entry) { return entry.isIntersecting; }).forEach(function (entry) {
      links.forEach(function (link) {
        if (link.hash === "#" + entry.target.id) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-10% 0px -65% 0px" });
  document.querySelectorAll(".wl-step").forEach(function (section) { observer.observe(section); });
})();
