<?php

namespace App\Jobs;

use Exception;
use ZipStream\ZipStream;
use App\Models\EventAsset;
use Illuminate\Bus\Queueable;
use App\Models\EventAssetDownload;
use App\Services\Enums\StatusEnum;
use App\Services\Helpers\FileService;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class ZipEventAssetsForDownloadJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $event_asset_download;

    /**
     * Create a new job instance.
     */
    public function __construct(EventAssetDownload $event_asset_download)
    {
        $this->event_asset_download = $event_asset_download;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $event_assets_ids = json_decode($this->event_asset_download->event_assets);
            $this->event_asset_download->update(['status' => StatusEnum::IN_PROGRESS]);
            $event_assets = EventAsset::whereIn('id', $event_assets_ids)->get();
    
            $zip_file_name = 'event_assets_' . $this->event_asset_download->event_id . '_' . time() . '.zip';
            $s3_zip_path = 'events/' . $this->event_asset_download->event_id . '/downloads/' . $zip_file_name;
    
            // Create a stream that will be written to S3
            $stream = fopen('php://temp', 'r+b');
    
            // Create ZipStream instance
            $zip = new ZipStream(outputStream: $stream);
    
            foreach ($event_assets as $event_asset) {
                try {
                    if ($file_data = FileService::get($event_asset->path, FileService::S3_DISK)) {
                        $zip->addFile(
                            fileName: basename($event_asset->path),
                            data: $file_data
                        );
                    }
                } catch (Exception $e) {
                    // 
                }
            }
    
            $zip->finish();
            rewind($stream);
    
            FileService::createFileWithPut($stream, $s3_zip_path, FileService::S3_DISK);

            fclose($stream);
    
            $this->event_asset_download->update([
                'status' => StatusEnum::ACTIVE,
                'path' => $s3_zip_path
            ]);
        } catch (\Exception $e) {
            $this->event_asset_download->update(['status' => StatusEnum::INACTIVE]);
            if (isset($stream) && is_resource($stream)) {
                fclose($stream);
            }
        }
    }
}
