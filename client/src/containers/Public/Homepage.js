import React from "react";
import { ListingLayout } from "../../components";
import { text } from "../../ultils/constant";

const Homepage = () => {
  return (
    <ListingLayout
      title={text.HOME_TITLE}
      description={text.HOME_DESCRIPTION}
      showProvince
      showCategorySidebar
    />
  );
};

export default Homepage;
