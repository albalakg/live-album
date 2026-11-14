<?php

$c = include 'C:/Users/Gal/ss-landing/config/event_landing.php';
$out = [];
foreach ($c['templates'] as $id => $t) {
    $out[$id] = [
        'id' => $t['id'],
        'type' => $t['type'],
        'name_he' => $t['name_he'],
        'dark' => $t['dark'],
        'default_font' => $t['default_font'],
        'gallery_style' => $t['gallery_style'],
        'default_palette_id' => $t['default_palette_id'],
        'sections' => $t['sections'],
        'allowed_sections' => $t['allowed_sections'],
        'default_enabled' => $t['default_enabled'],
        'palettes' => $t['palettes'],
        'stock' => $t['stock'],
    ];
}
$path = __DIR__ . '/m1-templates.json';
file_put_contents($path, json_encode($out, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n");
echo 'wrote ' . count($out) . " templates to $path\n";
