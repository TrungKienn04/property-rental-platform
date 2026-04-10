import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ListingLayout } from "../../components";
import { formatVietnameseToString } from "../../ultils/Common/formatVietnameseToString";

const Rental = () => {
  const { categories } = useSelector((state) => state.app);
  const [categoryCurrent, setCategoryCurrent] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const category = categories?.find(
      (item) => `/${formatVietnameseToString(item.value)}` === location.pathname,
    );

    setCategoryCurrent(category || null);
  }, [location.pathname, categories]);

  return (
    <ListingLayout
      title={categoryCurrent?.header || "Danh sách cho thuê"}
      description={categoryCurrent?.subheader || "Tổng hợp các tin đăng mới nhất theo danh mục đã chọn."}
      categoryCode={categoryCurrent?.code}
      showProvince
    />
  );
};

export default Rental;
