export interface StorageAll {
  setting?: StorageSetting;
  [url: string]: any;
}

interface CommonSettingItem {
  limit: number | null;
  checkParams: boolean;
  checkBody: boolean;
  removeRequestUrlParams: string[];
  removeRequestBodyParams: string[];
}

export interface StorageSetting extends CommonSettingItem {
  openSave: boolean;
  openMock: boolean;
  openUrl: string;
  listUrlRemoveStr: string[];
  filterUrl: string[];
  [prop: string]: any;
};

interface StorageItemDataI {
  method: string;
  requestParams: string;
  requestBody: string;
  response: string;
  name: string;
  timestamp: number;
  active: boolean;
  location?: string;
  [prop: string]: any;
}

export interface StorageItemData extends StorageItemDataI {}

export interface StorageItem extends CommonSettingItem {
  data: StorageItemDataI[];
  timestamp: number;
  top?: boolean;
  name?: string;
  compare?: boolean;
  [prop: string]: any;
}
