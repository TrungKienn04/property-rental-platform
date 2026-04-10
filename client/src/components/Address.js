import React, { memo, useEffect, useState } from "react";
import { InputReadOnly, Select } from "../components";
import { fetchVietnamDistricts, fetchVietnamProvinces } from "../services/location";

const Address = ({ setPayload }) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [reset, setReset] = useState(false);

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const results = await fetchVietnamProvinces();
        setProvinces(results);
      } catch (error) {
        setProvinces([]);
      }
    };

    loadProvinces();
  }, []);

  useEffect(() => {
    setDistrict("");

    const loadDistricts = async () => {
      try {
        const results = await fetchVietnamDistricts(province);
        setDistricts(results);
      } catch (error) {
        setDistricts([]);
      }
    };

    if (province) {
      loadDistricts();
      setReset(false);
    } else {
      setDistricts([]);
      setReset(true);
    }
  }, [province]);

  useEffect(() => {
    const provinceName = province
      ? provinces.find((item) => item.province_id === province)?.province_name
      : "";
    const districtName = district
      ? districts.find((item) => item.district_id === district)?.district_name
      : "";

    setPayload((prev) => ({
      ...prev,
      address: `${districtName ? `${districtName}, ` : ""}${provinceName || ""}`,
      province: provinceName || "",
      provinceCode:
        provinces.find((item) => item.province_id === province)?.province_code || "",
    }));
  }, [province, district, districts, provinces, setPayload]);

  const readonlyValue = `${district ? `${districts.find((item) => item.district_id === district)?.district_name}, ` : ""}${province ? provinces.find((item) => item.province_id === province)?.province_name : ""}`;

  return (
    <div>
      <h2 className="py-4 text-xl font-semibold">Địa chỉ cho thuê</h2>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Select
            type="province"
            value={province}
            setValue={setProvince}
            options={provinces}
            label="Tỉnh/Thành phố"
          />
          <Select
            reset={reset}
            type="district"
            value={district}
            setValue={setDistrict}
            options={districts}
            label="Quận/Huyện"
          />
        </div>
        <InputReadOnly label="Địa chỉ chính xác" value={readonlyValue} />
      </div>
    </div>
  );
};

export default memo(Address);
