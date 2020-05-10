import { useEffect, useState } from "react";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

export default function (initialState) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const hash = location.hash ? location.hash.toString().substring(1) : null;
    if (hash) {
      setState(JSON.parse(decompressFromEncodedURIComponent(hash)));
    }
  }, []);

  useEffect(() => {
    location.replace(
      `#${compressToEncodedURIComponent(JSON.stringify(state))}`,
    );
  }, [state]);

  return [state, setState];
}
