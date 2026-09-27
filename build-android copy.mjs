// build-android.mjs — bundles js/script.js for the Android/Capacitor www/ target.
//
// Run:  node build-android.mjs
//        (or via `npm run build:android`)
//
// What it does differently from a plain esbuild call:
//   • Swaps js/platform.js for js/platform.native.js so the Capacitor
//     Filesystem / Capacitor.isNativePlatform() code is included in the bundle.
//   • All other resolution is identical to a normal esbuild bundle.

import { build } from "esbuild";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const platformWebPath    = resolve(__dirname, "js/platform.js");
const platformNativePath = resolve(__dirname, "js/platform.native.js");

await build({
  entryPoints: ["js/script.js"],
  bundle: true,
  outfile: "www/js/script.js",
  format: "esm",
  plugins: [
    {
      name: "platform-alias",
      setup(build) {
        // When anything imports the web platform stub, redirect to native.
        build.onResolve({ filter: /platform\.js$/ }, (args) => {
          if (resolve(args.resolveDir, args.path) === platformWebPath) {
            return { path: platformNativePath };
          }
        });
      },
    },
  ],
});

console.log("✅  Android bundle written to www/js/script.js");
