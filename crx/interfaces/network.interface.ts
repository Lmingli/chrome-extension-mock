interface KeyValue {
  name: string;
  value: string;
}

export interface Request {
  headers: Array<KeyValue>;
  method: string;
  url: string;
  queryString: Array<KeyValue>;
  /** method===POST */
  postData: {
    mimeType: string;
    /** mimeType: x-www-form-urlencoded */
    params: Array<KeyValue>;
    /** mimeType: application/json: JSON stringify */
    text: string;
  };
};

