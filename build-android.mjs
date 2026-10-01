// build-android.mjs
//
// Builds the complete web app for Android/Capacitor.
//
// Run:
//   node build-android.mjs
//   npm run build:android
//
// What it does:
//   1. Builds SCSS → css/style.css
//   2. Copies the web app into www/
//   3. Copies HTML, shared assets, CSS, JS data and other web files
//   4. Bundles js/pages/list/list.js + js/pages/home/home.js for Android
//   5. Uses platform.native.js instead of platform.js
//   6. Syncs everything with Capacitor

import { build } from "esbuild";
import { resolve, dirname, relative } from "path";
import { fileURLToPath } from "url";
import { cp, mkdir, rm } from "fs/promises";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));

const root = __dirname;
const www = resolve(root, "www");

const platformWebPath = resolve(root, "js/platform.js");
const platformNativePath = resolve(root, "js/platform.native.js");

console.log("🚀 Building Make List for Android...\n");

// --------------------------------------------------
// 1. Build SCSS
// --------------------------------------------------

console.log("🎨 Building SCSS...");

execSync(
    "npx sass css/style.scss css/style.css --style=expanded --no-source-map",
    {
        cwd: root,
        stdio: "inherit",
    }
);

console.log("✅ CSS built\n");

// --------------------------------------------------
// 2. Clean www/
// --------------------------------------------------

console.log("🧹 Cleaning www/...");
await rm(www, { recursive: true, force: true });
await mkdir(www, { recursive: true });

console.log("✅ www/ cleaned\n");

// --------------------------------------------------
// 3. Copy web files into www/
// --------------------------------------------------

console.log("📦 Copying web files...");

// HTML files
await cp(resolve(root, "index.html"), resolve(www, "index.html"));
await cp(resolve(root, "list.html"), resolve(www, "list.html"));

// CSS
await cp(
    resolve(root, "css"),
    resolve(www, "css"),
    { recursive: true }
);

// Shared assets (used by both the browser app and the Capacitor app)
await cp(
    resolve(root, "assets"),
    resolve(www, "assets"),
    { recursive: true }
);

// JS source files. The page entry modules are bundled separately below.
await mkdir(resolve(www, "js"), { recursive: true });

await cp(
    resolve(root, "js/data.js"),
    resolve(www, "js/data.js")
);

console.log("✅ HTML copied");
console.log("✅ CSS copied");
console.log("✅ Images copied");
console.log("✅ JS files copied\n");

// --------------------------------------------------
// 4. Bundle page JavaScript for Android
// --------------------------------------------------

console.log("📦 Bundling Android JavaScript...");

await build({
    entryPoints: [
        resolve(root, "js/pages/list/list.js"),
        resolve(root, "js/pages/home/home.js"),
    ],
    bundle: true,
    outdir: resolve(www, "js"),
    // Without this, esbuild derives the output layout from the entry
    // points' own common ancestor (js/pages/), flattening it to
    // js/list/list.js + js/home/home.js — which wouldn't match the
    // js/pages/list/list.js + js/pages/home/home.js paths the copied
    // HTML files actually reference. Pinning outbase to js/ keeps the
    // full relative path, so the bundle lands where the HTML expects it.
    outbase: resolve(root, "js"),
    format: "esm",

    plugins: [
        {
            name: "platform-alias",

            setup(build) {
                build.onResolve(
                    { filter: /platform\.js$/ },
                    (args) => {
                        const requestedPath = resolve(
                            args.resolveDir,
                            args.path
                        );

                        if (requestedPath === platformWebPath) {
                            return {
                                path: platformNativePath,
                            };
                        }
                    }
                );
            },
        },
    ],
});

console.log("✅ Android JavaScript bundle created\n");

// --------------------------------------------------
// 5. Sync Capacitor
// --------------------------------------------------

console.log("🔄 Syncing Capacitor...");

execSync("npx cap sync android", {
    cwd: root,
    stdio: "inherit",
});

console.log("\n🎉 Android build preparation complete!");
console.log("📁 Web files → www/");
console.log("📱 Web files → Android");
console.log("\nRun this to launch the app:");
console.log("   npx cap run android");
