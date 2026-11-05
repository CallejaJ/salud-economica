import pkg from "../../package.json";
import { VERSION } from "../site";
import { en, es } from "../strings";

test("footer version matches package.json", () => expect(VERSION).toBe(pkg.version));

test("both languages have the same keys", () => expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort()));
