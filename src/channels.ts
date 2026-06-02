export type Channel = {
  category: string;
  name: string;
  logo: string;
  stream: string;
  status?: "working" | "maintenance" | "coming-soon";
  originalProvince?: string;
};

const rawChannels: Channel[] = [
  // VTV
  { category: "VTV", name: "VTV1", logo: "https://mytv.com.vn/upload/channel/1.png", stream: "https://live.fptplay53.net/fnxch2/vtv1hd_abr.smil/chunklist.m3u8" },
  { category: "VTV", name: "VTV2", logo: "https://mytv.com.vn/upload/channel/2.png", stream: "https://live.fptplay53.net/fnxch2/vtv2hd_abr.smil/chunklist.m3u8" },
  { category: "VTV", name: "VTV3", logo: "https://mytv.com.vn/upload/channel/3.png", stream: "https://live-a.fptplay53.net/live/media/VTV3HD/live_hls_avc/index.m3u8" },
  { category: "VTV", name: "VTV4", logo: "https://mytv.com.vn/upload/channel/4.png", stream: "https://live.fptplay53.net/fnxch2/vtv4hd_abr.smil/chunklist.m3u8" },
  { category: "VTV", name: "VTV5", logo: "https://mytv.com.vn/upload/channel/5.png", stream: "https://live-a.fptplay53.net/live/media/VTV5HD/live_hls_avc/index.m3u8" },
  { category: "VTV", name: "VTV5 Tây Nam Bộ", logo: "https://mytv.com.vn/upload/channel/5.png", stream: "https://live.fptplay53.net/fnxhd1/vtv5tnb_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "VTV", name: "VTV5 Tây Nguyên", logo: "https://mytv.com.vn/upload/channel/5.png", stream: "https://live.fptplay53.net/fnxhd1/vtv5taynguyen_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "VTV", name: "VTV6", logo: "https://mytv.com.vn/upload/channel/6.png", stream: "https://static.wikia.nocookie.net/ftv/images/2/28/Imageacknksdnjkvsdvjkbs.png/revision/latest?cb=20260530031557&path-prefix=vi" },
  { category: "VTV", name: "VTV7", logo: "https://s12812.cdn.mytvnet.vn/vimages/31/18/82/2f/fd/dd/3182f-pvtv7hd-channel-unkn.png", stream: "https://live.fptplay53.net/fnxhd1/vtv7hd_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "VTV", name: "VTV8", logo: "https://mytv.com.vn/upload/channel/68.png", stream: "https://live.fptplay53.net/epzhd1/vtv8hd_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "VTV", name: "VTV9", logo: "https://mytv.com.vn/upload/channel/117.png", stream: "https://live.fptplay53.net/epzch2/vtv9hd_abr.smil/chunklist_b4200000.m3u8" },
  { category: "VTV", name: "VTV10", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/VTV10_logo_2026_ver_3.png", stream: "https://live.fptplay53.net/live/media/VTV_can_tho/live_hls_avc/index.m3u8" },
  { category: "VTV", name: "Vietnam Today", logo: "https://static.wikia.nocookie.net/logos/images/0/0d/Vietnam_Today_black%2C_vertical%2C_gradient.png/revision/latest/scale-to-width-down/1000?cb=20260527071119&path-prefix=uk", stream: "https://live.fptplay53.net/fnxhd1/vntoday_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "K+", name: "K+ SPORT 1", logo: "https://img.vtvprime.vn/T8J7b_G8h1L6R-P_-m9_6_P6P-g/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvazFzcG9ydDEucG5n", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=195" },
  { category: "K+", name: "K+ SPORT 2", logo: "https://img.vtvprime.vn/T8J7b_G8h1L6R-P_-m9_6_P6P-g/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvazFzcG9ydDIucG5n", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=196" },
  { category: "VTC", name: "VTC1", logo: "https://static.wikia.nocookie.net/logos/images/0/07/VTC1_logo_2017.png", stream: "https://live.fptplay53.net/fnxch2/vtc1hd_abr.smil/chunklist.m3u8" },
  { category: "VTC", name: "VTC3", logo: "https://static.wikia.nocookie.net/logos/images/5/52/VTC3_logo_2017.png", stream: "https://live.fptplay53.net/fnxch2/vtc3hd_abr.smil/chunklist.m3u8" },

  // HTV
  { category: "HTV", name: "HTV1", logo: "https://static.wikia.nocookie.net/logos/images/2/26/HTV1_logo_ch%C3%ADnh_30-12-2024.png/revision/latest?cb=20260201034746&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=190" },
  { category: "HTV", name: "HTV2 / Vie Channel", logo: "https://static.wikia.nocookie.net/ftv/images/7/75/Cxxcvxasc.png/revision/latest/scale-to-width-down/1000?cb=20260411091027&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=191" },
  { category: "HTV", name: "HTV3", logo: "https://static.wikia.nocookie.net/ftv/images/2/2d/Imagevdvdf34.png/revision/latest/scale-to-width-down/1000?cb=20260411091251&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=192" },
  { category: "HTV", name: "HTV4", logo: "https://static.wikia.nocookie.net/ftv/images/3/3e/HTV4.png/revision/latest/scale-to-width-down/1000?cb=20260411090754&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=9" },
  { category: "HTV", name: "HTV5 / B Channel", logo: "https://static.wikia.nocookie.net/ftv/images/b/b9/ImageHTV5.png/revision/latest/scale-to-width-down/1000?cb=20260411090516&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=151" },
  { category: "HTV", name: "HTV7", logo: "https://static.wikia.nocookie.net/ftv/images/5/57/Htv7.png/revision/latest/scale-to-width-down/1000?cb=20260411090152&path-prefix=vi", stream: "https://vc.101vn.com/htv/htvcmb.php?id=256" },
  { category: "HTV", name: "HTV9", logo: "https://static.wikia.nocookie.net/ftv/images/d/da/Htv9.png/revision/latest/scale-to-width-down/1000?cb=20260411085737&path-prefix=vi", stream: "https://live.fptplay53.net/epzhd1/htv9hd_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "HTV", name: "HTV Thể Thao", logo: "https://static.wikia.nocookie.net/logos/images/f/f8/HTV_Th%E1%BB%83_thao_logo_12-2022.png/revision/latest?cb=20250507023141&path-prefix=vi", stream: "https://live.fptplay53.net/epzhd1/htvcthethao_vhls.smil/chunklist_b5000000.m3u8" },

  // VTVcab
  { category: "VTVcab", name: "ON SPORT +", logo: "https://img.vtvprime.vn/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvT04rU1BPUlQrLnBuZw==.png", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=193" },
  { category: "VTVcab", name: "ON FOOTBALL", logo: "https://img.vtvprime.vn/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvT04rRk9PVEJBTEwucG5n", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=194" },
  { category: "VTVcab", name: "ON TRENDING TV", logo: "https://img.vtvprime.vn/55xu-sW33ZbTdC_Jok1jkP6jWGpa3U96dXvvDuXoyz0/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvOGZjNzVhY2EtYjZhYS00MjYwLWIwMDMtZDRkYzg4OWI4ZGNkLnBuZw==.png", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=186" },
  { category: "VTVcab", name: "ON Kids", logo: "https://img.vtvprime.vn/L7ERumqY3GEtK8vTe_DtMEJRYJkZPrVD3O4cbdT5P44/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvOGFlYmUzZGMtODZmYS00NGFkLTlhNzUtODg5NmFkODZhNGI3LnBuZw==.png", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=179" },
  { category: "VTVcab", name: "ON Golf", logo: "https://static.wikia.nocookie.net/logos/images/f/ff/ON_Golf_logo_2022.png/revision/latest/scale-to-width-down/1000?cb=20220311023800&path-prefix=vi", stream: "https://toiyeuvietnam.dpdns.org/TuyetDoiKhongKinhDoanh/vtvcab-23-golf-channel/KenhCoBan.m3u8" },
  { category: "VTVcab", name: "ON E- Channel", logo: "https://img.vtvprime.vn/bofK3Lca_KQJMc9sb6pUyQ_A41aWbsQi2ibNAzkN3I0/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvZTk3YjgwOGUtNjI3OS00NWQ4LWJkMTAtNWY1MGE1MjIwMTZkLnBuZw==.png", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=182" },
  { category: "VTVcab", name: "ON Vie Giải Trí", logo: "https://img.vtvprime.vn/gV1k4G1mCGQpnNGJFCJQISd0-p96jY14Ufz_mOb8h_o/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvZjVhZDhkNmItMTQ4NS00YjYxLThhMDEtNTdiYzBiMjU2NGU1LnBuZw==.png", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=180" },
  { category: "VTVcab", name: "ON Vie Dramas", logo: "https://img.vtvprime.vn/mVzz9rvhJ_BCun2e4ILB0OYl8ptcxG9TsSrIZ85kpLk/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvMmExZjgwNGYtNjc0Yi00ZjYzLThjZWMtNjgwN2NkNThhYTRkLnBuZw==.png", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=177" },

  { category: "VTVcab", name: "ON Phim Việt", logo: "https://img.vtvprime.vn/vDASEJI2IRP0eBox0ta6hgKo4vnY-3AdofWLa5lSqjM/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvZTc3YzdkNmItZTVhNi00ZTkyLWIzYzUtMGEzMTkyZjIyM2RhLnBuZw==.png", stream: "https://vietanhtv.id.vn/tv360/175/index.m3u8" },
  { category: "VTVcab", name: "ON Movies - You TV", logo: "https://img.vtvprime.vn/8-eDFNeJkwyONvmJVu_JydPc2dZaNJXuBTY7vtvCxxE/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvZWQzOTEzNjgtYTJmNy00NDBkLWI0N2ItNzA2MDliNjJmNDYzLnBuZw==.png", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=181" },
  { category: "VTVcab", name: "ON O2TV", logo: "https://img.vtvprime.vn/5FxYjiz34GsArbti7aFiSkIO7NMCxKNZcQJ9AvIme80/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvODAyNGIwMDQtNGJiNC00M2Y3LWJkYmEtYmU0MWVkMGY0NjM4LnBuZw==.png", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=136" },
  { category: "VTVcab", name: "ON BiBi", logo: "https://img.vtvprime.vn/vjXRRLGeFrNx1iAkqhrK9RoAgU1oW6kq5q_6r7cd9zs/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvYzI3NWExNmEtNTMwOS00ZWE3LWJjMjMtYTMyNGIwZDczNGJlLnBuZw==.png", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=178" },
  { category: "VTVcab", name: "ON Info TV", logo: "https://img.vtvprime.vn/nCr-YgSmtNg5gcpJ35d6l_T4DUWz8fzr9EJpd9jAZ6E/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvM2E2NzM5NzQtNzRhYi00MjYxLTg2M2QtZWE2YzUyNzU5YzcyLnBuZw==.png", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=189" },
  { category: "VTVcab", name: "ON Cine", logo: "https://img.vtvprime.vn/XY6SjolNpy8W8Eh_v_2oDyE6BiNOvofLosgPYO-hlY4/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvZDY5YjgyNmUtNjkzYi00YzBiLWFhZmYtNmFhZGFjZjFhZDA0LnBuZw==.png", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=176" },
  { category: "VTVcab", name: "ON Style TV", logo: "https://img.vtvprime.vn/TxObOi0p9hC6K414i12Fk27SP8s_QKswAvPaRH2kK6M/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvNTcyOGM3MzEtOWE4OS00ZjljLTkyYTItMWVhODZmNzhiOWE4LnBuZw==.png", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=184" },
  { category: "VTVcab", name: "ON Music", logo: "https://img.vtvprime.vn/39RnkA6ZHfNSCcsMaaSivvTVwmWjeGsbqlQsmD7nuvQ/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvN2RmOTYzYTYtZWRkYS00MDdjLWIxYmYtYTAwODBhMTUyYTNlLnBuZw==.png", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=185" },
  { category: "VTVcab", name: "ON V Family", logo: "https://img.vtvprime.vn/8oeGePxG0Z-iJqm5biFVNdMdAlVHFDYsS0i7i3IpH2Y/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvOGI0YzYzOTgtNWJiOS00ODQ1LWE1ZjMtZTdhZTM5ZTc4NzVmLnBuZw==.png", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=187" },
  { category: "VTVcab", name: "ON Life", logo: "https://img.vtvprime.vn/cJ9URVIqC2BkU1gsT0IKiEy0tXDXqu7C4M3Ni3hjlgY/rs:fit:836:468/czM6Ly9wcmQtc24taW1hZ2VzL2NoYW5uZWwvY2U2MWMwZGEtMWI1Zi00ZWJiLWE4ZTktZjdmZTVkNzRlODhmLnBuZw==.png", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=188" },

  // Địa phương
  { category: "Địa phương", name: "An Giang 1 (ATV1)", logo: "https://static.wikia.nocookie.net/logos/images/8/81/ATV1_logo_09-07-2025.png/revision/latest/scale-to-width-down/1000?cb=20251109111844&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/angiang01_hls.smil/chunklist.m3u8" },
  { category: "Địa phương", name: "An Giang 2 (ATV2)", logo: "https://static.wikia.nocookie.net/logos/images/2/24/ATV2_logo_09-07-2025.png/revision/latest/scale-to-width-down/1000?cb=20250823043314&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/angiang_hls.smil/chunklist.m3u8" },
  { category: "Địa phương", name: "An Giang 3 (ATV3)", logo: "https://static.wikia.nocookie.net/logos/images/9/9f/ATV3_logo_09-07-2025.png/revision/latest/scale-to-width-down/1000?cb=20251109111209&path-prefix=vi", stream: "https://tv.angiangtv.vn/live/kgtv1/kgtv1.m3u8", status: "maintenance" },
  { category: "Địa phương", name: "Bắc Ninh (BTV)", logo: "https://static.wikia.nocookie.net/logos/images/9/91/BTV_HD_Bac_Ninh_logo.png/revision/latest/scale-to-width-down/1000?cb=20240414001634&path-prefix=vi", stream: "https://live.mediatech.vn/live/285f5f227e988ab4445a2138091d3d62e8d/playlist.m3u8", status: "maintenance" },
  { category: "Địa phương", name: "Cà Mau (CTV)", logo: "https://static.wikia.nocookie.net/logos/images/2/22/CTV_C%C3%A0_Mau.png/revision/latest/scale-to-width-down/985?cb=20211209002856&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=46" },
  { category: "Địa phương", name: "Cần Thơ 1", logo: "https://static.wikia.nocookie.net/logos/images/7/72/THTPCT.png/revision/latest/scale-to-width-down/1000?cb=20250703032839&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=47" },
  { category: "Địa phương", name: "Cần Thơ 2", logo: "https://static.wikia.nocookie.net/logos/images/7/72/THTPCT.png/revision/latest/scale-to-width-down/1000?cb=20250703032839&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=61" },
  { category: "Địa phương", name: "Cần Thơ 3", logo: "https://static.wikia.nocookie.net/logos/images/7/72/THTPCT.png/revision/latest/scale-to-width-down/1000?cb=20250703032839&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=84" },
  { category: "Địa phương", name: "Cao Bằng (CRTV)", logo: "https://static.wikia.nocookie.net/logos/images/8/8a/CRTV_logo_2020.png/revision/latest?cb=20260122145745&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=48" },
  { category: "Địa phương", name: "Đà Nẵng 1 (DNRT1)", logo: "https://static.wikia.nocookie.net/logos/images/5/58/DNRT1_logo.png/revision/latest?cb=20260212223625&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=49" },
  { category: "Địa phương", name: "Đà Nẵng 2 (DNRT2)", logo: "https://static.wikia.nocookie.net/logos/images/d/df/DNRT2_logo.png/revision/latest?cb=20260212223711&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=80" },
  { category: "Địa phương", name: "Đắk Lắk (DRT)", logo: "https://static.wikia.nocookie.net/logos/images/4/40/DRT_logo_2015_%28Dak_Lak%29.svg/revision/latest/scale-to-width-down/1000?cb=20230203121915&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=51" },
  { category: "Địa phương", name: "Điện Biên (ĐTV)", logo: "https://static.wikia.nocookie.net/logos/images/a/ac/%C4%90TV_logo_2014-2019_b%E1%BA%A3n_2.png/revision/latest/scale-to-width-down/1000?cb=20220720132707&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=52" },
  { category: "Địa phương", name: "Đồng Nai 1 (ĐNRTV1)", logo: "https://static.wikia.nocookie.net/logos/images/7/70/%C4%90NRTV1_HD.png/revision/latest/scale-to-width-down/1000?cb=20211025154909&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=53" },
  { category: "Địa phương", name: "Đồng Nai 2 (ĐNRTV2)", logo: "https://static.wikia.nocookie.net/logos/images/d/d0/%C4%90NRTV2_HD.png/revision/latest?cb=20211025161214&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=255" },
  { category: "Địa phương", name: "Đồng Tháp 1 (THĐT1)", logo: "https://img-zlr1.tv360.vn/image1/2024/10/07/16/1728292788373/2f4bec83df66_640_360.png", stream: "https://live.fptplay53.net/epzsd1/dongthap_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "Địa phương", name: "Đồng Tháp 2 (Miền Tây - THĐT2)", logo: "https://static.wikia.nocookie.net/logos/images/b/b9/Mi%E1%BB%81n_T%C3%A2y_TH%C4%90T2_2019-nay.png/revision/latest?cb=20260222061031&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/dongthaphd_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "Địa phương", name: "Gia Lai (GTV)", logo: "https://static.wikia.nocookie.net/logos/images/b/b6/GTV_Gia_Lai.png/revision/latest/scale-to-width-down/732?cb=20250729030224&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/gialai01_hls.smil/chunklist_b1800000.m3u8" },
  { category: "Địa phương", name: "Hà Nội 1 (H1)", logo: "https://static.wikia.nocookie.net/logos/images/f/fd/HanoiTV1_HD_2016-2026.png/revision/latest?cb=20241227073715&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=33" },
  { category: "Địa phương", name: "Hà Nội 2 (H2)", logo: "https://static.wikia.nocookie.net/logos/images/d/d6/HanoiTV2_HD_2016-2026.png/revision/latest?cb=20241228131942&path-prefix=vi", stream: "https://live.fptplay53.net/fnxhd1/hntv2_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "Địa phương", name: "Hà Tĩnh (BHTTV)", logo: "https://static.wikia.nocookie.net/logos/images/2/24/BHT_TV_logo_c%C3%B3_website.png/revision/latest/scale-to-width-down/1000?cb=20250419234452&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=58" },
  { category: "Địa phương", name: "Hải Phòng (THP)", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/THP_logo.svg/500px-THP_logo.svg.png", stream: "https://live.mediatech.vn/live/285a4c99665fdf84e94956c66bc7dc7eb5d/chunklist.m3u8", status: "maintenance" },
  { category: "Địa phương", name: "Hải Phòng 3 (THP3)", logo: "https://haiduongtv.mediatech.vn/upload/files/logo/Logo_THP3_chuan.png", stream: "https://live.mediatech.vn/live/28548ca35823d41426d8b3da7ed82bdab13/chunklist.m3u8", status: "maintenance" },
  { category: "Địa phương", name: "Huế (TRT)", logo: "https://static.wikia.nocookie.net/logos/images/7/74/TRT_2021-2025.png/revision/latest/scale-to-width-down/1000?cb=20250225033334&path-prefix=vi", stream: "https://live.fptplay53.net/epzsd1/hue_hls.smil/chunklist.m3u8" },
  { category: "Địa phương", name: "Hưng Yên (HYTV)", logo: "https://static.wikia.nocookie.net/logos/images/3/3d/HY_HD_logo_2019.png/revision/latest/scale-to-width-down/1000?cb=20220831005900&path-prefix=vi", stream: "https://live.mediatech.vn/live/285f5449d7d7d2946e0bd2d54b7e60f25a4/chunklist.m3u8", status: "maintenance" },
  { category: "Địa phương", name: "Khánh Hoà (KTV)", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/KTV_-_Kh%C3%A1nh_Ho%C3%A0.png", stream: "https://live.fptplay53.net/epzsd1/khanhhoa_hls.smil/chunklist.m3u8" },
  { category: "Địa phương", name: "Khánh Hoà 1", logo: "https://static.wikia.nocookie.net/logos/images/b/ba/KTV1_logo.png/revision/latest/scale-to-width-down/1000?cb=20260101114305&path-prefix=vi", stream: "https://vietanhtv.id.vn/tv360/76/index.m3u8", status: "maintenance" },
  { category: "Địa phương", name: "Lai Châu (LTV)", logo: "https://static.wikia.nocookie.net/logos/images/4/40/Logo_LTV_Lai_Ch%C3%A2u_2022_%28B%E1%BA%A3n_4%29.png/revision/latest?cb=20230614141136&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=68" },
  { category: "Địa phương", name: "Lâm Đồng 1 (LTV1)", logo: "https://static.wikia.nocookie.net/logos/images/8/8d/LTV1_Lam_Dong_logo_11-14.07.2025.png/revision/latest/scale-to-width-down/1000?cb=20250912111500&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=69" },
  { category: "Địa phương", name: "Lâm Đồng 2 (LTV2)", logo: "https://static.wikia.nocookie.net/logos/images/3/38/LTV2_Lam_Dong_logo_02-09-2025.png/revision/latest/scale-to-width-down/1000?cb=20250912114106&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=45" },
  { category: "Địa phương", name: "Lạng Sơn (LSTV)", logo: "https://static.wikia.nocookie.net/logos/images/7/70/LSTV_logo.png/revision/latest?cb=20220629080800&path-prefix=vi", stream: "https://stream.langsontv.vn/live/285c78da0c246524c90917842f8de03bd21/chunklist.m3u8" },
  { category: "Địa phương", name: "Lào Cai (THLC)", logo: "https://static.wikia.nocookie.net/logos/images/a/ad/THLC_2016.png/revision/latest?cb=20211224040641&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=71" },
  { category: "Địa phương", name: "Nghệ An (NTV)", logo: "https://img-zlr1.tv360.vn/image1/2020_09_23/1600821989411/75bfb004e210_640_360.png", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=74" },
  { category: "Địa phương", name: "Ninh Bình (NBTV)", logo: "https://static.wikia.nocookie.net/logos/images/9/94/NBTV_Ninh_B%C3%ACnh_logo.png/revision/latest/scale-to-width-down/200?cb=20211204172020&path-prefix=vi", stream: "https://live.mediatech.vn/live/28597f8fd7ea5064d0f84ab00b3699dfd86/playlist.m3u8", status: "maintenance" },
  { category: "Địa phương", name: "PTV HD", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Logo_%C4%90%C3%A0i_Ph%C3%A1t_thanh_%26_Truy%E1%BB%81n_h%C3%ACnh_Ph%C3%BA_Th%E1%BB%8D_-_PTV.svg/1280px-Logo_%C4%90%C3%A0i_Ph%C3%A1t_thanh_%26_Truy%E1%BB%81n_h%C3%ACnh_Ph%C3%BA_Th%E1%BB%8D_-_PTV.svg.png", stream: "https://live.fptplay53.net/fnxsd1/phutho_hls.smil/chunklist.m3u8" },
  { category: "Địa phương", name: "Quảng Ngãi 1 (QNgTV1)", logo: "https://static.wikia.nocookie.net/logos/images/e/e5/QNgTV_logo_2025_b%E1%BA%A3n_2.png/revision/latest/scale-to-width-down/1000?cb=20250823105757&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=81" },
  { category: "Địa phương", name: "Quảng Ngãi 2 (QNgTV2)", logo: "https://static.wikia.nocookie.net/logos/images/e/e5/QNgTV_logo_2025_b%E1%BA%A3n_2.png/revision/latest/scale-to-width-down/1000?cb=20250823105757&path-prefix=vi", stream: "https://ace.hoiquan.click/module/IPTV/?id=QNgTV2&accKenh=vuminhthanh1" },
  { category: "Địa phương", name: "Quảng Ninh 1 (QTV1)", logo: "https://static.wikia.nocookie.net/logos/images/a/a9/QTV1.png/revision/latest?cb=20230527102010&path-prefix=vi", stream: "https://Baoquangninh.vn/qtvlive/tv1live.m3u8" },
  { category: "Địa phương", name: "Quảng Ninh 3 (QTV3)", logo: "https://static.wikia.nocookie.net/logos/images/9/96/QTV3_logo_2014.png/revision/latest?cb=20230527102031&path-prefix=vi", stream: "https://Baoquangninh.vn/qtvlive/tv3live.m3u8" },
  { category: "Địa phương", name: "Quảng Trị (QTTV)", logo: "https://static.wikia.nocookie.net/logos/images/4/4e/QRTV_logo_28-01-2025.png/revision/latest/scale-to-width-down/1000?cb=20250311063146&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=83" },
  { category: "Địa phương", name: "Sơn La (STV)", logo: "https://static.wikia.nocookie.net/logos/images/7/73/STV_Son_La.png/revision/latest/scale-to-width-down/1200?cb=20250626171925&path-prefix=vi", stream: "https://cdn.sonlatv.vn/live/28595222e707a364251b8724717894baa46/playlist.m3u8", status: "maintenance" },
  { category: "Địa phương", name: "Tây Ninh (TTV)", logo: "https://static.wikia.nocookie.net/logos/images/4/46/TTV_TayNinhTV.png/revision/latest/scale-to-width-down/1000?cb=20250703001544&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=72" },
  { category: "Địa phương", name: "Thái Nguyên (TN)", logo: "https://static.wikia.nocookie.net/logos/images/4/42/TN_HD_logo_2017.png/revision/latest/scale-to-width-down/1000?cb=20231025071359&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=88" },
  { category: "Địa phương", name: "Thanh Hoá (TTV)", logo: "https://static.wikia.nocookie.net/logos/images/a/ad/Logo_TTV_Thanh_H%C3%B3a_2017_%28B%E1%BA%A3n_2%29.png/revision/latest/scale-to-width-down/1000?cb=20220727083250&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=89" },
  { category: "Địa phương", name: "Tuyên Quang (TTV)", logo: "https://static.wikia.nocookie.net/logos/images/6/66/TTV_Tuy%C3%AAn_Quang.png/revision/latest/scale-to-width-down/1000?cb=20220731123650&path-prefix=vi", stream: "https://streaming.tuyenquangtv.vn/channel/tuyenquang/playlist.m3u8" },
  { category: "Địa phương", name: "Vĩnh Long 1 (THVL1)", logo: "https://static.wikia.nocookie.net/logos/images/3/32/THVL1_logo_ident_2025.png/revision/latest/scale-to-width-down/1000?cb=20251206083051&path-prefix=vi", stream: "https://live.fptplay53.net/epzch2/vinhlong1_abr.smil/chunklist_b4200000.m3u8?cb=20260406" },
  { category: "Địa phương", name: "Vĩnh Long 2 (THVL2)", logo: "https://static.wikia.nocookie.net/logos/images/9/98/THVL2_logo_ident_2025.png/revision/latest/scale-to-width-down/1000?cb=20251206083053&path-prefix=vi", stream: "https://live.fptplay53.net/epzhd2/vinhlong2_vhls.smil/chunklist_b5000000.m3u8?cb=20260406" },
  { category: "Địa phương", name: "Vĩnh Long 3 (THVL3)", logo: "https://static.wikia.nocookie.net/logos/images/2/29/THVL3_logo_ident_2025.png/revision/latest/scale-to-width-down/1000?cb=20251206083054&path-prefix=vi", stream: "https://live.fptplay53.net/epzhd2/vinhlong3_vhls.smil/chunklist_b5000000.m3u8?cb=20260406" },
  { category: "Địa phương", name: "Vĩnh Long 4 (THVL4)", logo: "https://static.wikia.nocookie.net/logos/images/7/7e/THVL4_logo_ident_2025.png/revision/latest/scale-to-width-down/1000?cb=20251206083055&path-prefix=vi", stream: "https://live.fptplay53.net/epzhd2/vinhlong4hd_vhls.smil/chunklist_b5000000.m3u8?cb=20260406" },
  { category: "Địa phương", name: "Vĩnh Long 5 (THVL5)", logo: "https://static.wikia.nocookie.net/logos/images/3/3b/THVL5_logo_ident_2025.png/revision/latest/scale-to-width-down/1000?cb=20251206083057&path-prefix=vi", stream: "https://freem3u.xyz/api/live/play.m3u8?vid=91&cb=20260406" },

  // Thiết yếu
  { category: "Thiết yếu", name: "Truyền hình Công an Nhân dân (ANTV)", logo: "https://img-zlr1.tv360.vn/image1/2020_09_23/1600822516608/b33963dc0df8_640_360.png", stream: "https://live.fptplay53.net/fnxhd2/anninhtv_vhls.smil/chunklist_b5000000.m3u8" },
  { category: "Thiết yếu", name: "Truyền hình Quốc phòng Việt Nam (QPVN)", logo: "https://static.wikia.nocookie.net/logos/images/5/5d/QPVN.png/revision/latest/scale-to-width-down/1000?cb=20220827083916&path-prefix=vi", stream: "https://live.fptplay53.net/fnxhd2/quocphongvnhd_vhls.smil/chunklist_b5000000.m3u8" },

  // Phát thanh
  { category: "Phát thanh", name: "VOV1", logo: "https://static.wikia.nocookie.net/logos/images/0/0d/VOV1_logo_2017.png/revision/latest?cb=20220311024316&path-prefix=vi", stream: "https://vov.vn/live/vov1.m3u8" },
  { category: "Phát thanh", name: "VOV2", logo: "https://static.wikia.nocookie.net/logos/images/a/a4/VOV2_logo_2017.png/revision/latest?cb=20220311024317&path-prefix=vi", stream: "https://vov.vn/live/vov2.m3u8" },
  { category: "Phát thanh", name: "VOV3", logo: "https://static.wikia.nocookie.net/logos/images/a/a2/VOV3_logo_2017.png/revision/latest?cb=20220311024318&path-prefix=vi", stream: "https://vov.vn/live/vov3.m3u8" },
  { category: "Phát thanh", name: "VOV Giao thông Hà Nội", logo: "https://static.wikia.nocookie.net/logos/images/5/5e/VOV_Giao_th%C3%B4ng_logo_2017.png/revision/latest?cb=20220311024323&path-prefix=vi", stream: "https://vov.vn/live/vovgt-hn.m3u8" },
  { category: "Phát thanh", name: "VOV Giao thông TP.HCM", logo: "https://static.wikia.nocookie.net/logos/images/5/5e/VOV_Giao_th%C3%B4ng_logo_2017.png/revision/latest?cb=20220311024323&path-prefix=vi", stream: "https://vov.vn/live/vovgt-hcm.m3u8" },
];

export const channels: Channel[] = rawChannels.map(ch => {
  let name = ch.name;
  let logo = ch.logo;
  const lowerName = ch.name.toLowerCase();

  // 1. Logo URL Substitutions
  if (lowerName === "vietnam today") {
    logo = "https://static.wikia.nocookie.net/logos/images/a/a8/Vietnam_Today_07-2025_v2.png/revision/latest/scale-to-width-down/1000?cb=20250808040831&path-prefix=vi";
  } else if (lowerName.includes("htv2")) {
    logo = "https://static.wikia.nocookie.net/logos/images/7/75/HTV2_logo_2010-nay.png/revision/latest/scale-to-width-down/1000?cb=20231116055125&path-prefix=vi";
  } else if (lowerName.includes("htv3")) {
    logo = "https://static.wikia.nocookie.net/logos/images/e/e4/HTV3_2009-2019.png/revision/latest?cb=20240907084329&path-prefix=vi";
  } else if (lowerName.includes("htv4")) {
    logo = "https://static.wikia.nocookie.net/logos/images/1/10/HTV4_logo_2014-2018.png/revision/latest?cb=20180814115707&path-prefix=vi";
  } else if (lowerName.includes("htv5")) {
    logo = "https://static.wikia.nocookie.net/logos/images/b/bc/HTV5_Bchannel_logo_ch%C3%ADnh.png/revision/latest?cb=20260528063037&path-prefix=vi";
  } else if (lowerName.includes("htv7")) {
    logo = "https://static.wikia.nocookie.net/logos/images/c/cf/HTV7_HD_logo_2017-2019.png/revision/latest?cb=20231211054022&path-prefix=vi";
  } else if (lowerName.includes("htv9")) {
    logo = "https://static.wikia.nocookie.net/logos/images/e/ea/HTV9_HD_logo_2021-2022.png/revision/latest/scale-to-width-down/1000?cb=20240315133319&path-prefix=vi";
  } else if (lowerName.includes("htv thể thao")) {
    logo = "https://static.wikia.nocookie.net/logos/images/4/4c/HTV_Th%E1%BB%83_thao_logo.png/revision/latest/scale-to-width-down/1000?cb=20231108113057&path-prefix=vi";
  }

  // 2. Name Simplification for local channels
  if (ch.category === "Địa phương") {
    const parenMatch = name.match(/\(([^)]+)\)/);
    if (parenMatch) {
      const abbr = parenMatch[1].trim();
      if (abbr === "TTV") {
        // Keep both name and abbreviation as is for duplicate case (e.g. Thanh Hóa, Tuyên Quang, Tây Ninh)
      } else if (abbr.includes(" - ")) {
        const parts = abbr.split(" - ");
        name = parts[parts.length - 1].trim();
      } else {
        name = abbr;
      }
    } else {
      if (name.startsWith("Cần Thơ")) {
        name = name.replace("Cần Thơ", "THTPCT");
      } else if (name === "Khánh Hoà 1") {
        name = "KTV1";
      } else if (name === "PTV HD") {
        name = "PTV";
      }
    }
  }

  // 3. Append HD for all except audio radio channels
  if (ch.category !== "Phát thanh") {
    if (!name.toUpperCase().endsWith("HD") && !name.toUpperCase().includes(" HD")) {
      name = name + " HD";
    }
  }

  // 4. Fill originalProvince for Local Channels
  let originalProvince: string | undefined = undefined;
  if (ch.category === "Địa phương") {
    let clean = ch.name.replace(/\([^)]+\)/g, "").trim();
    clean = clean.replace(/\s*\d+\s*$/, "").trim();
    if (clean === "Huế") {
      originalProvince = "Thừa Thiên Huế";
    } else if (clean === "PTV" || clean === "PTV HD") {
      originalProvince = "Phú Thọ";
    } else {
      originalProvince = clean;
    }
  }

  return {
    ...ch,
    name,
    logo,
    originalProvince
  };
});
