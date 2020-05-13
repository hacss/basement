import { useEffect, useState } from "react";

export default callback => {
  const [id, setId] = useState("");
  const [code, setCode] = useState("");
  const [config, setConfig] = useState("");
  const [worker, setWorker] = useState();

  useEffect(() => {
    const listener = e => {
      const { data } = e;

      if (
        data.type !== "hacssRes" ||
        data.code !== code ||
        data.config !== config
      ) {
        return;
      }

      const { result } = data;

      callback && callback(result);
    };

    window.addEventListener("message", listener);

    return () => window.removeEventListener("message", listener);
  }, [callback, code, config]);

  useEffect(() => {
    const worker = document.createElement("iframe");
    worker.setAttribute("class", "display:none;");
    worker.setAttribute("sandbox", "allow-scripts allow-same-origin");
    document.body.appendChild(worker);

    const script = worker.contentDocument.createElement("script");
    script.textContent = `
      window.onmessage = function(e) {
        var data = e.data;

        if (data.type !== "hacssReq") {
          return;
        }

        var msg = {
          type: "hacssRes",
          code: e.data.code,
          config: e.data.config
        };

        var respond = function(result) {
          msg.result = result;
          window.parent.postMessage(msg, "*");
        };

        var config;
        try {
          config = new Function(
            e.data.config
              .replace(
                /require\\(['"]@hacss\\/plugin\\-(.*)["']\\)/g,
                function(_, x) {
                  return "window.parent.hacssPlugins." + x;
                }
              )
              .replace(/module\\.exports\\s*=/, "return ")
          )() || {};
          config.scope = "#${id}";
        }
        catch (err) {
          return respond({ error: ["CONFIG", err.message] });
        }

        var css, ignored;
        try {
          var result = window.parent.hacss(e.data.code, config);
          css = window.parent.autoprefixer.process(result.css).css;
          ignored = result.ignored;
        }
        catch (err) {
          // Most likely this is redundant, as @hacss/core@2 tries very hard not to throw.
          return respond({ error: ["HACSS", err.message] });
        }

        if (ignored.length) {
          return respond({
            warning: [
              "INVALID_RULES",
              ignored
                .map(function(x) {
                  return x.className + " - " + x.error;
                })
                .join("\\n")
            ],
            css: css,
          });
        }

        respond({ css: css });
      };
    `;

    worker.contentDocument.body.appendChild(script);

    setWorker(worker);

    return () => document.body.removeChild(worker);
  }, [id]);

  useEffect(() => {
    if (worker && worker.contentWindow) {
      worker.contentWindow.postMessage(
        {
          type: "hacssReq",
          code,
          config,
        },
        "*",
      );
    }
  }, [code, config, worker]);

  return [setId, setCode, setConfig];
};
