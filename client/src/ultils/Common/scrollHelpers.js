export const scrollToTop = (behavior = "smooth") => {
  try {
    window.scrollTo({ top: 0, behavior });
  } catch (error) {
    // ignore
  }
};

export const scrollToElementWithHeaderOffset = (
  element,
  { behavior = "smooth", extraOffset = 12 } = {},
) => {
  if (!element) return;

  try {
    const header = document.querySelector("header");
    const nav = document.getElementById("main-nav");
    const headerHeight = header ? header.offsetHeight : 0;
    const navHeight = nav ? nav.offsetHeight : 0;
    const top =
      element.getBoundingClientRect().top +
      window.scrollY -
      headerHeight -
      navHeight -
      extraOffset;

    window.scrollTo({
      top: Math.max(0, top),
      behavior,
    });
  } catch (error) {
    // ignore
  }
};

export const scrollToIdWithHeaderOffset = (id, options) => {
  if (!id) return false;

  try {
    const element = document.getElementById(id);
    if (!element) return false;
    scrollToElementWithHeaderOffset(element, options);
    return true;
  } catch (error) {
    return false;
  }
};

export const scrollToPostList = (options) =>
  scrollToIdWithHeaderOffset("post-list", options);

