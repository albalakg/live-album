import axios from "axios";

export interface EventAnalyticsOverview {
  landing_visitors: number;
  upload_page_visitors: number;
  uploaders: number;
  gallery_visitors: number;
  rates: {
    landing_to_upload_page: number;
    upload_page_to_upload: number;
    upload_to_gallery: number;
  };
  total_guest_uploads: number;
  avg_uploads_per_uploader: number;
  photos: number;
  videos: number;
  pending: number;
  approved: number;
  blocked: number;
  peak_upload_hour: number | null;
  gallery_download_events: number;
  gallery_download_items: number;
  active_visitors_15m: number;
}

export async function fetchEventAnalyticsOverview(
  eventId: number
): Promise<EventAnalyticsOverview | null> {
  if (!eventId) return null;
  const res = await axios.get(`events/${eventId}/analytics/overview`);
  return (res.data?.data as EventAnalyticsOverview) || null;
}
