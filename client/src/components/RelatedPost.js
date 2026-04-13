import React, { useEffect } from "react";
import { Sitem } from "./index";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../store/actions";

const RelatedPost = () => {
  const { newPosts } = useSelector((state) => state.post);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.getNewPosts());
  }, [dispatch]);

  return (
    <div className="surface-card w-full rounded-[28px] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900">Tin mới đăng</h3>
      </div>
      <div className="flex w-full flex-col gap-3">
        {newPosts?.map((item) => (
          <Sitem
            key={item.id}
            id={item.id}
            title={item.title}
            price={item?.attributes?.price}
            createdAt={item.createdAt}
            image={item?.images?.image}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedPost;
