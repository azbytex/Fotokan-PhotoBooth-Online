// Foto contoh dari Unsplash, disimpan di public/samples.
const SAMPLE_COUNT = 6;

export function getSamplePhoto(index = 0): string {
  return `/samples/sample-${(index % SAMPLE_COUNT) + 1}.jpg`;
}
