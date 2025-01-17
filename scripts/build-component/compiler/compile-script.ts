/*
 * Tencent is pleased to support the open source community by making
 * 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 *
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.  All rights reserved.
 *
 * 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) is licensed under the MIT License.
 *
 * License for 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition):
 *
 * ---------------------------------------------------
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
*/
import * as rollup from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import jsx from 'acorn-jsx';
import json from '@rollup/plugin-json';
import svg from 'rollup-plugin-svg';
// import { parse, resolve as r } from 'path';

export const rollupBuildScript = async (url: string, outPath: string, globals: rollup.GlobalsOption) => {
  const extensions = ['.ts', '.js', '.tsx'];
  // console.info(r(parse(url).dir, '../tsconfig.json'), '=====');
  const bundle = await rollup.rollup({
    input: url,
    external(id) {
      // if (url === '/root/Workspace/tencent-git/bkui-vue3/packages/styles/src/index.ts') {
      //   console.error('dddddddddddddddddddddddddddddd', url, id);
      // }
      return /^vue/.test(id) || /^@bkui-vue/.test(id) || /reset\.less$/.test(id);
    },
    acornInjectPlugins: [jsx()],
    plugins: [
      svg(),
      json(),
      typescript({
        // tsconfig: r(parse(url).dir, '../tsconfig.json'),
        // useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            declaration: false,
            // declarationDir: parse(outPath).dir,
          },
        },
      }),
      resolve({ extensions: ['.ts', '.tsx', '.js', '.jsx'] }),
      commonjs({ extensions }),
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        presets: [
          ['@babel/preset-env'],
          '@babel/preset-typescript',
        ],
        plugins: [
          '@vue/babel-plugin-jsx',
          '@babel/plugin-transform-runtime',
        ],
      }),
      terser(),
    ],
  });
  await bundle.write({
    format: 'umd',
    name: 'bkuiVue',
    file: outPath,
    exports: 'named',
    globals,
    paths(id: string) {
      if (/^@bkui-vue/.test(id)) {
        if (id.match(/^@bkui-vue\/icon/)) {
          return id;
        }
        return id.replace('@bkui-vue', '..');
      }
      // id: /root/Workspace/tencent-git/bkui-vue3/packages/styles/src/reset.less
      if (/reset\.less$/.test(id)) {
        return './reset.less';
      }
      return id;
    },
  });
  await bundle.close();
};
