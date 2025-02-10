export type SeriesRequests = {
  series_name: string;
  series_code: string;
  is_active: boolean;
  category_id: string;
  detail: SeriesDetailRequest[]; // Pastikan ini sesuai dengan data yang diterima
};

export type SeriesHeaderRequest = {
  id: string;
  series_name: string;
  series_code: string;
  is_active: boolean;
  category_id: string;
  created_by: string;
  created_date: Date;
};

export type SeriesQuery = {
  search?: string;
  active?: boolean;
  page?: number;
  date?: string;
  category?: number;
};

export type SeriesDetailRequest = {
  question_id: string;
};
