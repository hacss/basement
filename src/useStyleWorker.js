import { useEffect, useState } from "react";

export default callback => {
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
  }, [code, config]);

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
          )();
        }
        catch (err) {
          return respond({ error: ["CONFIG", err.message] });
        }

        var css;
        try {
          css = window.parent.hacss(e.data.code, config);
        }
        catch (err) {
          return respond({ error: ["HACSS", err.message] });
        }

        var rules = css
          .split("\\n")
          .map(function(rule) {
            try {
              return [ [], [window.parent.autoprefixer.process(rule).css] ];
            }
            catch(e) {
              return [ [rule], [] ];
            }
          })
          .reduce(function(all, current) {
            return [
              all[0].concat(current[0]),
              all[1].concat(current[1])
            ];
          }, [[], []]);

        if (rules[0].length) {
          return respond({
            warning: ["INVALID_RULES", rules[0].join("\\n")],
            css: rules[1].join("\\n")
          });
        }

        respond({ css: rules[1].join("\\n") });
      };
    `;

    worker.contentDocument.body.appendChild(script);

    setWorker(worker);

    return () => {
      document.body.removeChild(worker);
      setWorker(null);
    };
  }, []);

  useEffect(() => {
    if (worker) {
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

  return [setCode, setConfig];
};
