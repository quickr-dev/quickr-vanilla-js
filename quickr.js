(() => {
  const productionUrl = "https://vanilla-js.quickr.dev";
  const quickrUrl = "https://quickr-cdn.quickr.dev"; // Replace with your quickr subdomain

  document.querySelectorAll("img[data-src]").forEach((img) => {
    const { src } = img.dataset;
    const transformationsObject = transformationsAsObject(img);

    img.loading = "lazy";
    img.decoding = "async";

    if (!shouldOptimize()) {
      img.src = src;
    } else if (src.startsWith("http")) {
      img.src = getSrc(src, transformationsObject);
      img.srcset = getSrcSet(src, transformationsObject);
    } else {
      const absoluteSrc =
        productionUrl + (src.startsWith("/") ? src : `/${src}`);

      img.src = getSrc(absoluteSrc, transformationsObject);
      img.srcset = getSrcSet(absoluteSrc, transformationsObject);
    }
  });

  function shouldOptimize() {
    const isProduction = location.href.startsWith(productionUrl);

    return isProduction;
  }

  function getSrc(src, transformationsObject) {
    return [
      quickrUrl,
      transformationsAsString(transformationsObject),
      src,
    ].join("/");
  }

  function getSrcSet(src, transformationsObject) {
    transformationsObject.fit ||= "scale-down";

    if (transformationsObject.width) {
      return `
        ${getSrc(src, transformationsObject)} 1x,
        ${getSrc(src, {
          ...transformationsObject,
          width: Math.min(transformationsObject.width * 2, 1920),
        })} 2x
      `;
    } else {
      return `
        ${getSrc(src, { ...transformationsObject, width: 640 })} 640w,
        ${getSrc(src, { ...transformationsObject, width: 960 })} 960w,
        ${getSrc(src, { ...transformationsObject, width: 1200 })} 1200w,
        ${getSrc(src, { ...transformationsObject, width: 1600 })} 1600w,
        ${getSrc(src, { ...transformationsObject, width: 1920 })} 1920w
      `;
    }
  }

  /**
   * @param {String} transformations e.g. 'width=800,fit=scale-down'
   * @return {Object} e.g. {width: 800, fit: 'scale-down'}
   */
  function transformationsAsObject(img) {
    const { transformations = "" } = img.dataset;
    const transformationsObject = {};

    if (img.width) transformationsObject.width = img.width;
    if (img.height) transformationsObject.height = img.height;

    return Object.fromEntries(
      transformations
        .split(",")
        .filter(Boolean)
        .map((pair) => {
          const [key, value] = pair.split("=");
          return [key, isNaN(value) ? value : Number(value)];
        })
    );
  }

  /**
   * @param {Object} transformations e.g. {width: 800, fit: 'scale-down'}
   * @return {String} e.g. 'width=800,fit=scale-down'
   */
  function transformationsAsString(transformationsObject) {
    return Object.entries(transformationsObject)
      .filter(([_key, value]) => Boolean(value))
      .map(([key, value]) => `${key}=${value}`)
      .join(",");
  }
})();
