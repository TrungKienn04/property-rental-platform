import React, { useEffect } from "react";
import { Button, Item } from "../../components";
import {
  createSearchParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPostsLimit } from "../../store/actions/post";

const {
  buildSearchParamsObject,
  mergeQueryValues,
} = require("../../ultils/Common/queryHelpers");

const List = ({ categoryCode }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { posts } = useSelector((state) => state.post);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentQuery = buildSearchParamsObject(searchParams);
    const nextQuery = mergeQueryValues(currentQuery, {
      categoryCode,
    });

    dispatch(getPostsLimit(nextQuery));
  }, [searchParams, categoryCode, dispatch]);

  const updateSort = (sort) => {
    const currentQuery = buildSearchParamsObject(searchParams);
    const nextQuery = mergeQueryValues(currentQuery, {
      sort,
      page: 1,
    });

    navigate({
      pathname: location.pathname,
      search: createSearchParams(nextQuery).toString(),
    });
  };

  return (
    <section className="surface-card rounded-[32px] p-4 lg:p-6">
      <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h4 className="text-2xl font-extrabold text-slate-900">
            Danh sách tin đăng
          </h4>
          <span className="text-sm text-slate-500">
            Ưu tiên bố cục dễ đọc, thao tác nhanh và hiển thị rõ thông tin chính.
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-slate-500">
            Sắp xếp
          </span>
          <Button
            bgColor={!searchParams.get("sort") ? "bg-slate-900" : "bg-slate-100"}
            text="Mặc định"
            textColor={!searchParams.get("sort") ? "text-white" : "text-slate-700"}
            className="min-h-[42px] text-sm shadow-none hover:shadow-sm"
            onClick={() => updateSort(null)}
          />
          <Button
            bgColor={searchParams.get("sort") === "latest" ? "bg-amber-400" : "bg-slate-100"}
            text="Mới nhất"
            textColor={searchParams.get("sort") === "latest" ? "text-slate-950" : "text-slate-700"}
            className="min-h-[42px] text-sm shadow-none hover:shadow-sm"
            onClick={() => updateSort("latest")}
          />
        </div>
      </div>

      <div className="space-y-5">
        {posts?.length ? (
          posts.map((item) => (
            <Item
              key={item?.id}
              address={item?.address}
              attributes={item?.attributes}
              description={item?.description}
              images={item?.images?.image}
              star={+item?.star}
              title={item?.title}
              user={item?.user}
              id={item?.id}
            />
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-slate-500">
            Không tìm thấy bài đăng phù hợp với tổ hợp filter hiện tại.
          </div>
        )}
      </div>
    </section>
  );
};

export default List;
