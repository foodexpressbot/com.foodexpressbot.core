"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.default = (dir) => {
    const scan = (dir, files = []) => {
        const root = fs_1.default.readdirSync(dir);
        root.forEach((file) => {
            if (fs_1.default.statSync(path_1.default.join(dir, file)).isDirectory())
                files = scan(path_1.default.join(dir, file), files);
            else
                files.push(path_1.default.join(dir, file));
        });
        return files;
    };
    return scan(dir);
};
//# sourceMappingURL=directoryScan.js.map