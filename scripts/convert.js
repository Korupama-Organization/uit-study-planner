
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import axios from 'axios';

const url = 'https://daa.uit.edu.vn/danh-muc-mon-hoc-dai-hoc';

axios.get(url)
    .then(response => {
        const html = response.data;
        const $ = cheerio.load(html);
        const data = [];

        $('table.tablesorter tbody tr').each((i, el) => {
            const row = $(el).find('td');

            const getText = (element) => {
                return element.text().trim().replace(/\u00a0/g, ' ').trim();
            }

            const getCourses = (index) => {
              const cellHtml = $(row[index]).html();
              if (!cellHtml) return [];
              return cellHtml.split('<br>').map(s => $(`<td>${s}</td>`).text().trim()).filter(s => s);
            }

            const so_tclt = parseInt(getText($(row[11]))) || 0;
            const so_tcth = parseInt(getText($(row[12]))) || 0;

            const course = {
                'stt': getText($(row[0])),
                'ma_mon_hoc': getText($(row[1])),
                'ten_mon_hoc': getText($(row[2])),
                'ten_mon_hoc_en': getText($(row[3])),
                'con_mo_lop': $(row[4]).find('img').attr('title') === 'Hiện đang mở',
                'don_vi_quan_ly': getText($(row[5])),
                'loai_mon_hoc': getText($(row[6])),
                'ma_cu': getText($(row[7])),
                'mon_hoc_tuong_duong': getCourses(8),
                'mon_hoc_tien_quyet': getCourses(9),
                'mon_hoc_truoc': getCourses(10),
                'so_tin_chi_ly_thuyet': so_tclt,
                'so_tin_chi_thuc_hanh': so_tcth,
                'so_tin_chi': so_tclt + so_tcth,
            };
            data.push(course);
        });

        fs.writeFileSync('danh_muc_mon_hoc.json', JSON.stringify(data, null, 2));
    })
    .catch(console.error);
