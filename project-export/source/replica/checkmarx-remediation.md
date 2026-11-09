# Checkmarx remediation record

Source scan: af78dd42-5d58-45b2-91aa-8b9b7ebfc843; 99 SCA and 4 SAST findings. Source report SHA256: 2be924a82e4d13ea26d3e26a6fa8dacfbf8d5a109d3fc0d05b09daedfc2cc294.

All actionable source and dependency findings have local remediation evidence. This is not a Checkmarx compliance certificate. A new scan of this corrected source and lockfile is required. One upstream-withdrawn braces advisory needs Checkmarx triage, and the local picomatch patch needs security review because version-only scanners may still flag it. Do not suppress findings without security approval.

Validation: clean installation, 536 Node tests, 3 Python tests, TypeScript, production build and dependency-tree validation passed. Fresh npm audit reports zero vulnerabilities. Npm advisory coverage differs from Checkmarx.

Local runtime package changes and licenses are documented in cloud/vendor/SECURITY-PATCHES.md. Keep the local patch until a verified upstream fix replaces it; rerun the isolated exploit and font/PNG compatibility tests on upgrades.

## SCA findings

| Result ID | Component / scanned | CVE | Current versions | Disposition |
| --- | --- | --- | --- | --- |
| uYzgiy13qSNOtZ0nMEB2g8cPW9GT3ajfvSGd08hPax0= | react-server-dom-webpack 19.2.6 | CVE-2026-44907 | react-server-dom-webpack 19.3.1 | updated |
| ZIRUSI3tClTDocfhCrvrCpz1FhGYq2c85yVmphz8ixM= | sharp 0.35.4 | CVE-2026-114111 | sharp 0.35.5 | updated |
| Iw34Nf19GEdpM3Zr2xtN+z8yb5+WGAbZNnLDyDk2Erg= | sharp 0.35.4 | Cx9723c087-1490 | sharp 0.35.5 | updated |
| j1STTIvcGE/6IdraVFDPtECBn47fIaDp17/PSaMEmVQ= | source-map-js 1.2.1 | CVE-2026-93749 | source-map-js 1.2.2 | updated |
| GQ6Khu8VszUWhDD8jIwKIYdQrv4Fh2hRjWPgc1S01Y0= | undici 7.24.8 | CVE-2026-9697 | undici 7.30.2 | updated |
| mEcNSAHdcFNmqcx4grfL2/hYI9HSo/Bvq1K9+ITG/Cc= | undici 7.24.8 | CVE-2026-84961 | undici 7.30.2 | updated |
| W0bgyW0s1DgckQZGROtQ6kmKsLT8j0a5xYHa0P1roiY= | undici 7.24.8 | CVE-2026-109383 | undici 7.30.2 | updated |
| 0O8X3OLCr6pm2147SGm5tuwTDVh7as+P5Brm0cji0D8= | undici 7.24.8 | CVE-2026-87029 | undici 7.30.2 | updated |
| dTBND0MOBIW3EF/vu1JIPh7ZhR0+1S1SUbdjKqh09ys= | undici 7.24.8 | CVE-2026-109869 | undici 7.30.2 | updated |
| 4ea/j0dz9uQv8EwBu333JwSpEpJtA51qa46hEjM+Dqo= | undici 7.24.8 | CVE-2026-87018 | undici 7.30.2 | updated |
| 11xZ1HU8uYmq/zzgFWM/OIpw23oLMPW1M7Izm6Ok0TI= | undici 7.24.8 | CVE-2026-85014 | undici 7.30.2 | updated |
| cg8wQ4u6XGVq2R/vErqUCK4rUGX6xXq7zad2wkOs4CQ= | undici 7.24.8 | CVE-2026-19534 | undici 7.30.2 | updated |
| YpDumks3Bya9lTJG7ARO7wX9rfREb3z6bRDIMQjRfbg= | undici 7.24.8 | CVE-2026-120222 | undici 7.30.2 | updated |
| Jga2EqKJ9WOPeEDErrdsmRlz6JLUPa1TqoF2vLITEDE= | undici 7.24.8 | CVE-2026-109841 | undici 7.30.2 | updated |
| 9xmXktO7TMCMpJBPn9AVSRY+fgyTUwHEQQ0q8stevEo= | undici 7.24.8 | CVE-2026-109924 | undici 7.30.2 | updated |
| mILRBbYtwznxBpN/7XfKdSTqHCHScU284f5r2xUvW/8= | undici 7.24.8 | CVE-2026-84890 | undici 7.30.2 | updated |
| t1qr5SCE7mMtPfMfGyvL0hrbu+11wIEiEDwvVmMpWGg= | undici 7.24.8 | CVE-2026-109932 | undici 7.30.2 | updated |
| 571OWza179XO0sIEaGFA+aSJXqiwZPg33j1y05bEEKs= | undici 7.24.8 | CVE-2026-12151 | undici 7.30.2 | updated |
| dyT/3f8J7lUIimhUmpLRQV4ykGL/Ob+jrmpTdIjZT94= | undici 7.24.8 | CVE-2026-84933 | undici 7.30.2 | updated |
| oOINVatHfSxhXvntLAByfNq2EAfLvkCQ8qtB/MF0R8A= | undici 7.24.8 | CVE-2026-120415 | undici 7.30.2 | updated |
| PY3ivzYiMHVUgF5uJpldRer/HbwJq10iG2S5TdQ8m7Y= | undici 7.24.8 | CVE-2026-13697 | undici 7.30.2 | updated |
| Y5HXoCBL3JB7mADQ7A+GYJjPOmb3V3/fcdjVR6dWui0= | undici 7.24.8 | CVE-2026-14643 | undici 7.30.2 | updated |
| yPjJPBRqvu91T1A3sffIR95CNxgtY8sd04w1ILYRwiw= | undici 7.24.8 | CVE-2026-6734 | undici 7.30.2 | updated |
| U9nCslnWC4ISoUoNMjYRy4n442RzpSOf8EVx3AJDL9w= | undici 7.24.8 | CVE-2026-116630 | undici 7.30.2 | updated |
| VMUP715xMZK9eDnOz1R5aNG4zXOrAwgNA4ZfOOLUQn4= | undici 7.24.8 | CVE-2026-109829 | undici 7.30.2 | updated |
| p6CHlls6BEzXtv4Nus7PF/eNVev5PquFoVzt6YlIjYs= | undici 7.24.8 | CVE-2026-120423 | undici 7.30.2 | updated |
| UfouBN7p81a+YkGY5IAlU1lqpRm2E/CfbCcfG4hKUCE= | undici 7.24.8 | CVE-2026-120474 | undici 7.30.2 | updated |
| RYCQHaGFPlKy3p84JlVjKK7qk0Zd8tBE49s4v28dCuM= | undici 7.24.8 | CVE-2026-9678 | undici 7.30.2 | updated |
| kUfJWmrOT0i+j5nhJK+Rt0GMyq+0gHJUut9/lwC27Pw= | undici 7.24.8 | CVE-2026-15157 | undici 7.30.2 | updated |
| nmnQaCxRg7gcrvVrX0Jn2q4pS2ewd1WRzBv2WV292T0= | undici 7.24.8 | CVE-2026-9679 | undici 7.30.2 | updated |
| iolTTPxvuk+2kHwtBpuUeY5GhrlE1VMlUkLGefYWJg8= | undici 7.24.8 | CVE-2026-16728 | undici 7.30.2 | updated |
| eF1h4tVKb/0r1RQxmTF5C4+zkCTIybN34e4CldidFYk= | undici 7.24.8 | CVE-2026-18540 | undici 7.30.2 | updated |
| MOuRCl4of7YOTMXrlFy5uj7qu0FgBvM8kdqAJq2Yqks= | undici 7.24.8 | CVE-2026-16729 | undici 7.30.2 | updated |
| bhkm4e/I4CAhToXV6CiSQZrGAu5GwxoxYH13WdZTqDc= | undici 7.24.8 | CVE-2026-18149 | undici 7.30.2 | updated |
| VPz2H0DV+8PSwtrtLNh45/QDdF8VL/saT+fGug+bOFc= | undici 7.24.8 | CVE-2026-84947 | undici 7.30.2 | updated |
| vXTNCdqrl21LakEaeU5SUBdTZen6jDcmm742vogkAvM= | undici 7.24.8 | CVE-2026-85008 | undici 7.30.2 | updated |
| +jSCHCwjmhGKiZd6y+5No/GkSOWR3/skBi2+IzWrIWw= | undici 7.24.8 | CVE-2026-11525 | undici 7.30.2 | updated |
| IhmX6rEWw8uDVcfDTx+6xh8ewX4fQ1ugx3sMJRMO7wk= | undici 7.24.8 | CVE-2026-6733 | undici 7.30.2 | updated |
| wdu2LMe4WkDam3dc7XgV1ViZMh9rIeEFbdDy43XdRyM= | zod 3.25.76 | CVE-2023-54404 | zod 4.6.7 | updated |
| w5KdYISpR1gjSawDT9i+ZS0Vz99xJxyg9WbnzPg5HQ4= | esbuild 0.18.20 | Cxa83491f0-29a9 | esbuild 0.28.2 | updated |
| VAb77vZRJ8xUWQSgmM+Y9k9qO27RJ/9pMNL0DRoTP/g= | esbuild 0.18.20 | Cxbb85e86c-2fac | esbuild 0.28.2 | updated |
| +o8yeSidODANzXKIR28TJvSEjC4YL97SUmti7ZYC60Q= | brace-expansion 1.1.14 | CVE-2026-102278 | brace-expansion 5.0.12, brace-expansion 1.1.21 | updated |
| VMKKKCi8gfW7aVcOHFCUIFFFE6VJDOnrE1dH6HJJv9Q= | brace-expansion 1.1.14 | CVE-2026-13149 | brace-expansion 5.0.12, brace-expansion 1.1.21 | updated |
| VFw5tMgDF/NFn4/DxuJd+1KSx0z15hZPKQ/QuH2T6Yg= | brace-expansion 1.1.14 | CVE-2026-14257 | brace-expansion 5.0.12, brace-expansion 1.1.21 | updated |
| eSGaL9vzlEZJwOO5oftrc87oEZbBDQYmFU1DBoSQe9I= | brace-expansion 1.1.14 | CVE-2026-69152 | brace-expansion 5.0.12, brace-expansion 1.1.21 | updated |
| VEsikHs95IGyu6Al+0g4j+Om64yUDxIShxe0rk73VCc= | brace-expansion 1.1.14 | CVE-2026-102276 | brace-expansion 5.0.12, brace-expansion 1.1.21 | updated |
| AsBErB3PoDt6MUYGAwYSUGTHv/6CjqgDsXgVWUVgPmw= | brace-expansion 1.1.14 | CVE-2026-102277 | brace-expansion 5.0.12, brace-expansion 1.1.21 | updated |
| hqmc38FnfnKIg4VqdG+KVIBnUZAyCJanNyhsisg921Y= | esbuild 0.25.12 | Cxa83491f0-29a9 | esbuild 0.28.2 | updated |
| VtwcsSNd7O3S4OyAKf4zDzQY8k1RfyoPK1WWGAs3nc0= | esbuild 0.27.3 | Cxa83491f0-29a9 | esbuild 0.28.2 | updated |
| wwrVEwULrv+2AoiA3cwqpVUFqyzxE1XkPEeLrxZ2jpc= | esbuild 0.28.0 | Cxa83491f0-29a9 | esbuild 0.28.2 | updated |
| LioIBamVWB4BRWutOyybVNTqOeDiekK0HCJwd2o3GwE= | ws 8.18.0 | CVE-2026-62389 | ws 8.22.2 | updated |
| 8hAmlx6AuPa3DB97/ErI9tELjoGjuZEUChu+Yz01V4I= | ws 8.18.0 | CVE-2026-48779 | ws 8.22.2 | updated |
| z/HzIwMqa5Ph4xA9K7zmZsuL1hYEy0NI8GE2N+4CBGA= | ws 8.18.0 | CVE-2026-45736 | ws 8.22.2 | updated |
| y3zRqUOezfQVcuAZF7FyFEFydYK6M3Sd8dOmxPjuNro= | brace-expansion 5.0.6 | CVE-2026-102276 | brace-expansion 5.0.12, brace-expansion 1.1.21 | updated |
| cKyf3jKXr+XnocCME9vpVmAA7WTBOZP24J0hujthmf0= | brace-expansion 5.0.6 | CVE-2026-102278 | brace-expansion 5.0.12, brace-expansion 1.1.21 | updated |
| 6DyYGX8QJM4Ojgqb7pAfnfEvlxoCZWvdF0qnVnQ8tBM= | brace-expansion 5.0.6 | CVE-2026-13149 | brace-expansion 5.0.12, brace-expansion 1.1.21 | updated |
| AHWcE0cIWDjPQdqze/5vpRs4d73ZhAoU4JWAkTWliO4= | brace-expansion 5.0.6 | CVE-2026-14257 | brace-expansion 5.0.12, brace-expansion 1.1.21 | updated |
| RaK/EW8uMbtzP+0EVXG1mB0M3MNkQ3BziBozZSE6gIc= | brace-expansion 5.0.6 | CVE-2026-69152 | brace-expansion 5.0.12, brace-expansion 1.1.21 | updated |
| RDzTFDCtquCOldCQeim2qn9eyj8ktgGLREuJc2zn2w0= | brace-expansion 5.0.6 | CVE-2026-102277 | brace-expansion 5.0.12, brace-expansion 1.1.21 | updated |
| uSI47eMBpA/Gc6BPZpPjkozXFWvnfxs8tAoNWjCFpnA= | image-size 2.0.2 | CVE-2025-71329 | Absent | removed |
| XhTGDkHEi6161npPWLI9Hi+pnGW9UOWYI7i3V97cOl0= | image-size 2.0.2 | CVE-2025-71330 | Absent | removed |
| RNmbJmlYl9kvBT0KN3NtecWUVuWrYRnXyQrBHhCDStk= | js-yaml 4.1.1 | CVE-2026-59869 | js-yaml 4.3.2 | updated |
| +fD0qlzDCeAlRHR62uMvTXZMir8CycxeXqiBZah1a6o= | js-yaml 4.1.1 | Cx0e1b35ca-f68b | js-yaml 4.3.2 | updated |
| fGSZtFQu7SVGvmchcEu4SoddvErupwX+6AVO6zS+LYA= | js-yaml 4.1.1 | CVE-2026-53550 | js-yaml 4.3.2 | updated |
| WN/ltgiQlS1CFjXN/e0s7+Q4lHDIPST1XHA27v5v2YQ= | js-yaml 4.1.1 | CVE-2026-84375 | js-yaml 4.3.2 | updated |
| YdhO/GdusN/jepgaDGfdlewNuEBxWtGQiFbnbQA0EdU= | next 16.3.4 | CVE-2026-94482 | next 16.5.0-canary.45 | updated |
| Bc4E6kNZF9Rf3MTuswyUwg6iMOYhdNHqhig7OlMiRc4= | next 16.3.4 | CVE-2026-94483 | next 16.5.0-canary.45 | updated |
| EaUrqqyXAtT8Ggl0kc/ewnMOxYSaxTW2hL/ViZGpPSE= | next 16.3.4 | CVE-2026-103004 | next 16.5.0-canary.45 | updated |
| WiekOFQgk90n6QB9I1lTOiBAQF3eF1xepYV7rEJ4BYM= | next 16.3.4 | CVE-2026-94484 | next 16.5.0-canary.45 | updated |
| AWqPfIWYTLUT2LKA1fwU46idsAeA94QMC+x+eghpz/A= | next 16.3.4 | CVE-2026-94543 | next 16.5.0-canary.45 | updated |
| V+CsvUgqjGhDNkCbbhHKiDqgp3IM+ScHWoju5E1cGWc= | next 16.3.4 | CVE-2026-94544 | next 16.5.0-canary.45 | updated |
| GWTiVzvqOPeP4wshFjaC8P7FSDIryE2qHSntA+XblUk= | next 16.3.4 | CVE-2026-94485 | next 16.5.0-canary.45 | updated |
| NtnS+kvzg8BYJ1e7fxSaYv4/UdMeNvjd2pRpVRvwg4A= | next 16.3.4 | CVE-2026-94486 | next 16.5.0-canary.45 | updated |
| 58Vr5xpvFXCgLwcCl3JUvxIMubh/7yufLkKFcmu4M24= | next 16.3.4 | Cx4d0219bd-432f | next 16.5.0-canary.45 | updated |
| ukPznkEs97kqMI9awCCMDH6IN1pzH3xiXyeNCozXJYQ= | next 16.3.4 | CVE-2026-94545 | next 16.5.0-canary.45 | updated |
| qG7aIG3I9V7saZc+RrRd84yUslvlnWmmO4zR/djDUn4= | next 16.3.4 | Cx61e93c63-e4fb | next 16.5.0-canary.45 | updated |
| /YkcAkkfhqsuIVdPbkH50TMdKRAnKW2QF1pMxTXiZ1Q= | braces 3.0.3 | CVE-2026-93687 | braces 3.0.3 | withdrawn-upstream-requires-triage |
| IosN+v43DsF1X8uq1JoWkhwDsYoNM/FyOFeRm/vMhXY= | browserslist 4.28.2 | CVE-2026-73088 | browserslist 4.29.5 | updated |
| gEVS52VRZzthWcoRzEWVG9o3n73gSZ6ztKzSsl/gc/g= | browserslist 4.28.2 | CVE-2026-73089 | browserslist 4.29.5 | updated |
| F0ZztGmFTQdC8dPy+jWwzZi9uCL21tpw3sXo7ah4l50= | vite 8.0.13 | CVE-2026-53571 | vite 8.3.6 | updated |
| hDdO0OAc35Qiu8Ceu6CWof3mXT/KVdFYcsaiXgvTu64= | vite 8.0.13 | CVE-2026-112942 | vite 8.3.6 | updated |
| vF8mhtJARM3bnhhhFnv7rTjAv3T+x5lYydMHb+nMWEo= | vite 8.0.13 | CVE-2026-112943 | vite 8.3.6 | updated |
| +KdHQcB5/EtW0lHaO6dMX9mW71k6aWLnaRuA9Iqcxnw= | vite 8.0.13 | CVE-2026-112944 | vite 8.3.6 | updated |
| xzba81b69nLygw8e6h/Ghgkp5IU9GV8gBKqSeis9btY= | vite 8.0.13 | CVE-2026-53632 | vite 8.3.6 | updated |
| elDU9g6BfhlG8rpG1x+6Iuq6cgMq110i8SXZQ0ctx8M= | uri-js 4.4.1 | CVE-2026-93690 | fast-uri 3.1.9 | replaced |
| QBePHq+lH1oaRJEd9BGr6CbkvfFQmdFvta76jQw0I8Q= | uri-js 4.4.1 | CVE-2026-93751 | fast-uri 3.1.9 | replaced |
| sBE7isAYaRfPfmRLL+ZeGu2IGrX4x8uM4JwEOEUkshs= | picomatch 2.3.2 | CVE-2026-112366 | picomatch 4.0.7+mirra.security.1 | locally-patched-requires-review |
| Krrh0lpTIn0A2j8iyoS9IhFqKtPNinUrr8K8rGR5+/A= | picomatch 4.0.4 | CVE-2026-112366 | picomatch 4.0.7+mirra.security.1 | locally-patched-requires-review |
| vkMZljwJ79de+2e6xSrl7TbKhuEmtBOe76YxAB8WHLw= | baseline-browser-mapping 2.10.30 | CVE-2026-45819 | baseline-browser-mapping 2.11.35 | updated |
| sQRGWKrmQcVLRmx0W+2aT1lTg8+Qm+HOg3I6PGK6F50= | fast-uri 3.1.7 | CVE-2026-110180 | fast-uri 3.1.9 | updated |
| Pih3SEbw3Atb1Sh+eqLJQRnR2WFnj9XJVGz1pAv96Ck= | fast-uri 3.1.7 | CVE-2026-110306 | fast-uri 3.1.9 | updated |
| 3ZaGbSl7f9yRXhtYmyUaEMrcCs69UDNAwc+boGdSEfI= | fast-uri 3.1.7 | CVE-2026-86472 | fast-uri 3.1.9 | updated |
| QoVxdROJKHV/1wwhCVe4iSBwODwvrpXTvmh2pgo1xA8= | fast-uri 3.1.7 | CVE-2026-110725 | fast-uri 3.1.9 | updated |
| aojKF/QhuQcPOovj9qB9/Eozy/qXUev+1K9ChtheUsU= | fast-uri 3.1.7 | CVE-2026-110095 | fast-uri 3.1.9 | updated |
| t7sAU2my0phdWfUqwfdYF5loHqjtvcUr/UP03pH5eXU= | fflate 0.7.4 | CVE-2026-122146 | Absent | removed |
| s6OdfT5Q1Ds5dgN4PFq7Bwu1DhlLDPQIinLxksSS+Tw= | fflate 0.7.4 | CVE-2026-45820 | Absent | removed |
| G2Qm8hwayc5IVljdnV/Aa37khVDPYgF/R7JtEh5T0pY= | minimatch 10.2.5 | CVE-2026-118764 | minimatch 11.0.5, minimatch 3.1.5 | updated |
| juCagkSg90Jv5ZZ84Md7Npgce6SQBwM/8OtFJ30U44w= | @babel/core 7.29.0 | CVE-2026-49356 | @babel/core 7.29.6 | updated |
| Bl732itsBrpdRvVSsbeNK+VXZXzr99pR0bU8A/gcVbQ= | debug 3.2.7 | Cx8bc4df28-fcf5 | debug 4.4.3 | updated |

## SAST findings

- -1336301462: Python input controls loop; .agents/skills/replica-entrepreneur/reviews.py. Bounded bytes/themes/pattern count/pattern length/total count; fixed range loops; 3 Python negative and compatibility tests pass.
- 1833334604: JavaScript input controls loop; src/model.mjs. Explicit MAX_BOARD_ITEMS traversal bound and early 100000-item cap; cycle/oversize regressions and 10000-frame validation, 30000-frame containment/descendant scale checks pass.
- 781281479: Missing HSTS; scripts/qa-artifact-preview.mjs. Shared HSTS max-age=31536000; includeSubDomains on success/error preview responses, Worker API and static asset policy.
- 1304887931: Missing CSP; scripts/qa-artifact-preview.mjs. Shared CSP default/script self, object none, base none, frame-ancestors self; preview success/error tests and production asset/API responses verified.

## Upstream exceptions and local changes

- /YkcAkkfhqsuIVdPbkH50TMdKRAnKW2QF1pMxTXiZ1Q= (CVE-2026-93687): GHSA-vfj7-8cjw-p6xm was withdrawn by GitHub on 2026-10-23 as not practically exploitable. Request Checkmarx security triage; no clean Checkmarx result is claimed. https://github.com/advisories/GHSA-vfj7-8cjw-p6xm https://github.com/micromatch/braces/issues/70
- elDU9g6BfhlG8rpG1x+6Iuq6cgMq110i8SXZQ0ctx8M= (CVE-2026-93690): Original uri-js implementation replaced with fast-uri alias; Unicode termination and actual AJV6 relative-reference compatibility tests pass. https://github.com/advisories/GHSA-ffpj-9hx9-929p https://cwe.mitre.org/data/definitions/176.html
- QBePHq+lH1oaRJEd9BGr6CbkvfFQmdFvta76jQw0I8Q= (CVE-2026-93751): Original uri-js implementation replaced with fast-uri alias; Unicode termination and actual AJV6 relative-reference compatibility tests pass. https://github.com/advisories/GHSA-7g43-p94j-qr58 https://github.com/garycourt/uri-js/issues/106 https://github.com/garycourt/uri-js/blob/a1acf730b4bba3f1097c9f52e7d9d3aba8cdcaae/src/uri.ts#L103-L141
- sBE7isAYaRfPfmRLL+ZeGu2IGrX4x8uM4JwEOEUkshs= (CVE-2026-112366): Auditable single-branch repeated-extglob guard; reproduced exploit now terminates in a 2-second isolated-process regression, including disabled optional recursion guard. Not an upstream release. Installed parse.js SHA256 a849fc60b71ad29e64bc291572d25021c12d9332306c9dec4b3348c8ac9e1c7f https://github.com/advisories/GHSA-fc5q-39xc-vjpf https://github.com/micromatch/picomatch/pull/194
- Krrh0lpTIn0A2j8iyoS9IhFqKtPNinUrr8K8rGR5+/A= (CVE-2026-112366): Auditable single-branch repeated-extglob guard; reproduced exploit now terminates in a 2-second isolated-process regression, including disabled optional recursion guard. Not an upstream release. Installed parse.js SHA256 a849fc60b71ad29e64bc291572d25021c12d9332306c9dec4b3348c8ac9e1c7f https://github.com/advisories/GHSA-fc5q-39xc-vjpf https://github.com/micromatch/picomatch/pull/194

Rerun: node scripts/checkmarx-security-check.mjs after the audit and regression suite. The accompanying JSON preserves every finding and installed path.
