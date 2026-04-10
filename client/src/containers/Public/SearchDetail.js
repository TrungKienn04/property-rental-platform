import React from "react";
import { useLocation } from "react-router-dom";
import { ListingLayout } from "../../components";

const SearchDetail = () => {
  const location = useLocation();
  const titleSearch = location.state?.titleSearch || "Kết quả tìm kiếm";

  return (
    <ListingLayout
      title={titleSearch}
      description={`${titleSearch}. Hệ thống đang hiển thị kết quả theo đúng tổ hợp filter đã chọn và vẫn giữ cụm khu vực nổi bật để bạn đổi nhanh sang tỉnh khác.`}
      showProvince
    />
  );
};

export default SearchDetail;
