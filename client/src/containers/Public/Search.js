import React, { useEffect, useState } from "react";
import { createSearchParams, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Modal, SearchItem } from "../../components";
import icons from "../../ultils/icons";
import { path } from "../../ultils/constant";
const {
  buildSearchParamsObject,
  buildSearchTitle,
  mergeQueryValues,
} = require("../../ultils/Common/queryHelpers");

const {
  BsChevronRight,
  FiSearch,
  HiOutlineLocationMarker,
  MdOutlineHouseSiding,
  RiCrop2Line,
  TbReportMoney,
} = icons;

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isShowModal, setIsShowModal] = useState(false);
  const [content, setContent] = useState([]);
  const [name, setName] = useState("");
  const [queries, setQueries] = useState({});
  const [arrMinMax, setArrMinMax] = useState({});
  const [defaultText, setDefaultText] = useState("");
  const { provinces, areas, prices, categories } = useSelector((state) => state.app);

  useEffect(() => {
    const currentQuery = buildSearchParamsObject(searchParams);
    const nextQueries = {};
    const provinceCode = currentQuery.provinceCode;
    const categoryCode = currentQuery.categoryCode;
    const priceCode = currentQuery.priceCode;
    const areaCode = currentQuery.areaCode;
    const priceRange = currentQuery.priceNumber;
    const areaRange = currentQuery.areaNumber;

    if (provinceCode) {
      nextQueries.provinceCode = provinceCode;
      nextQueries.province =
        provinces?.find((item) => item.code === provinceCode)?.value || "";
    }
    if (categoryCode) {
      nextQueries.categoryCode = categoryCode;
      nextQueries.category =
        categories?.find((item) => item.code === categoryCode)?.value || "";
    }
    if (priceCode) {
      nextQueries.priceCode = priceCode;
      nextQueries.price = prices?.find((item) => item.code === priceCode)?.value || "";
    }
    if (areaCode) {
      nextQueries.areaCode = areaCode;
      nextQueries.area = areas?.find((item) => item.code === areaCode)?.value || "";
    }
    if (priceRange && !nextQueries.price) {
      const values = Array.isArray(priceRange) ? priceRange : [priceRange];
      nextQueries.priceNumber = values;
      nextQueries.price = `Từ ${values[0]} - ${values[1]} triệu`;
    }
    if (areaRange && !nextQueries.area) {
      const values = Array.isArray(areaRange) ? areaRange : [areaRange];
      nextQueries.areaNumber = values;
      nextQueries.area = `Từ ${values[0]} - ${values[1]} m2`;
    }

    if (location.pathname.includes(path.LOGIN)) return;

    if (location.pathname.includes(path.SEARCH)) {
      setQueries(nextQueries);
      return;
    }

    if (!searchParams.toString()) {
      setQueries({});
      setArrMinMax({});
    }
  }, [searchParams, location.pathname, provinces, areas, prices, categories]);

  const handleShowModal = (nextContent, nextName, nextDefaultText) => {
    setContent(nextContent);
    setName(nextName);
    setDefaultText(nextDefaultText);
    setIsShowModal(true);
  };

  const handleSubmit = (event, query, nextArrMinMax) => {
    event.stopPropagation();
    
    const patch = { ...query };
    if (patch.priceNumber) patch.priceCode = null;
    if (patch.areaNumber) patch.areaCode = null;

    setQueries((prev) => mergeQueryValues(prev, patch));
    setIsShowModal(false);
    if (nextArrMinMax) {
      setArrMinMax((prev) => ({ ...prev, ...nextArrMinMax }));
    }
  };

  const handleSearch = () => {
    const queryCodes = Object.entries(queries).reduce((accumulator, [key, value]) => {
      if (key.includes("Code") || key.includes("Number")) {
        accumulator[key] = value;
      }
      return accumulator;
    }, {});

    navigate(
      {
        pathname: `/${path.SEARCH}`,
        search: createSearchParams(mergeQueryValues(queryCodes, { page: 1 })).toString(),
        hash: "#post-list",
      },
      { state: { titleSearch: buildSearchTitle(queries) } },
    );
  };

  return (
    <>
      <section className="w-full rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-amber-700 p-4 shadow-xl lg:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
          <button
            type="button"
            onClick={() => handleShowModal(categories, "category", "Tìm tất cả")}
            className="text-left"
          >
            <SearchItem
              IconBefore={<MdOutlineHouseSiding />}
              fontWeight
              IconAfter={<BsChevronRight color="rgb(148 163 184)" />}
              text={queries.category}
              defaultText="Tìm tất cả"
            />
          </button>
          <button
            type="button"
            onClick={() => handleShowModal(provinces, "province", "Toàn quốc")}
            className="text-left"
          >
            <SearchItem
              IconBefore={<HiOutlineLocationMarker />}
              IconAfter={<BsChevronRight color="rgb(148 163 184)" />}
              text={queries.province}
              defaultText="Toàn quốc"
            />
          </button>
          <button
            type="button"
            onClick={() => handleShowModal(prices, "price", "Chọn giá")}
            className="text-left"
          >
            <SearchItem
              IconBefore={<TbReportMoney />}
              IconAfter={<BsChevronRight color="rgb(148 163 184)" />}
              text={queries.price}
              defaultText="Chọn giá"
            />
          </button>
          <button
            type="button"
            onClick={() => handleShowModal(areas, "area", "Chọn diện tích")}
            className="text-left"
          >
            <SearchItem
              IconBefore={<RiCrop2Line />}
              IconAfter={<BsChevronRight color="rgb(148 163 184)" />}
              text={queries.area}
              defaultText="Chọn diện tích"
            />
          </button>
          <button
            type="button"
            onClick={handleSearch}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            <FiSearch />
            Tìm kiếm
          </button>
        </div>
      </section>
      {isShowModal && (
        <Modal
          handleSubmit={handleSubmit}
          queries={queries}
          arrMinMax={arrMinMax}
          content={content}
          name={name}
          setIsShowModal={setIsShowModal}
          defaultText={defaultText}
        />
      )}
    </>
  );
};

export default Search;
