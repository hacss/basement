import { useEffect, useState } from "react";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

export default function (initialState, compress = x => x, decompress = x => x) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const hash = location.hash ? location.hash.toString().substring(1) : null;
    if (hash) {
      setState(decompress(JSON.parse(decompressFromEncodedURIComponent(hash))));
    }
  }, []);

  useEffect(() => {
    location.replace(
      `#${compressToEncodedURIComponent(JSON.stringify(compress(state)))}`,
    );
  }, [state]);

  return [state, setState];
}
