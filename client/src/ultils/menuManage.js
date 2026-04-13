import icons from "./icons";
import { path } from "./constant";

const { isAdminRole } = require("./Common/authHelpers");

const { ImPencil2, MdOutlineLibraryBooks, BiUserPin } = icons;

const createPostItem = {
  id: "header-create-post",
  text: "Đăng tin cho thuê",
  path: `/he-thong/${path.CREATE_POST}`,
  icon: <ImPencil2 />,
};

const editProfileItem = {
  id: "header-edit-profile",
  text: "Sửa thông tin cá nhân",
  path: `/he-thong/${path.EDIT_PROFILE}`,
  icon: <BiUserPin />,
};

const getMenuManage = (role) => {
  const manageItem = isAdminRole(role)
    ? {
        id: "header-manage-all-posts",
        text: "Quản lý tất cả bài đăng",
        path: `/he-thong/${path.MANAGE_POSTS}`,
        icon: <MdOutlineLibraryBooks />,
        highlight: true,
        badge: "Admin",
      }
    : {
        id: "header-manage-own-posts",
        text: "Quản lý bài của tôi",
        path: `/he-thong/${path.MANAGE_POSTS}`,
        icon: <MdOutlineLibraryBooks />,
      };

  return isAdminRole(role)
    ? [manageItem, createPostItem, editProfileItem]
    : [createPostItem, manageItem, editProfileItem];
};

export default getMenuManage;
