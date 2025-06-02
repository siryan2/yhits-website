import path from "node:path";
import * as sass from "sass";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import { HtmlBasePlugin } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";

export default async function(eleventyConfig) {
	// Configure Eleventy
  eleventyConfig.setOutputDirectory("dist");
  eleventyConfig.setInputDirectory("src");

  eleventyConfig.addPassthroughCopy({
    "./public/": "/"
  });
  // eleventyConfig.addPassthroughCopy("public");

  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  // Images
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// output image formats
		formats: ["webp", "jpeg"],

    outputDir: "./dist/img/",
    urlPath: "/img/",

		// output image widths
		widths: [320, 640, 960, 1200],

    sizes: [
      "(max-width: 320px) 100vw",
      "(max-width: 640px) 100vw",
      "(max-width: 960px) 100vw",
      "(max-width: 1200px) 100vw",
    ],

		// optional, attributes assigned on <img> nodes override these values
		htmlOptions: {
			imgAttributes: {
				loading: "lazy",
				decoding: "async",
			},
			pictureAttributes: {}
		}
	});

  // Recognize Sass as a "template languages"
  eleventyConfig.addTemplateFormats("scss");

  // Compile Sass
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    compile: async function (inputContent, inputPath) {
      // Skip files like _fileName.scss
      let parsed = path.parse(inputPath);
      if (parsed.name.startsWith("_")) {
        return;
      }

      // Run file content through Sass
      let result = sass.compileString(inputContent, {
        loadPaths: [parsed.dir || "."],
        sourceMap: false, // or true, your choice!
      });

      // Allow included files from @use or @import to
      // trigger rebuilds when using --incremental
      this.addDependencies(inputPath, result.loadedUrls);

      return async () => {
        return result.css;
      };
    }
  });

  // Exclude CSS files (for Sitemap.xml)
  eleventyConfig.addCollection("noCssPages", function(collectionApi) {
    return collectionApi.getAll().filter(item => !item.url.startsWith("/css/"));
  });
};

export const config = {
  // Control which files Eleventy will process
  // e.g.: *.md, *.njk, *.html, *.liquid
  templateFormats: [
    "md",
    "njk",
    "html",
    "liquid",
    "11ty.js"
  ],

  // Pre-process *.md files with: (default: `liquid`)
  markdownTemplateEngine: "njk",

  // Pre-process *.html files with: (default: `liquid`)
  htmlTemplateEngine: "njk"
};
