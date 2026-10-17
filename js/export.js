/**
 * Export and Save Functionality
 */

(function (exports) {
  /**
   * Triggers download of a string blob in browser
   * @param {string} content
   * @param {string} filename
   * @param {string} contentType
   */
  function downloadBlob(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Converts SVG string to PNG image and triggers download
   * @param {string} svgString
   * @param {string} filename
   * @param {number} scale - Resolution multiplier (e.g., 2 for high-DPI)
   */
  function exportToPNG(svgString, filename = 'puzzle.png', scale = 2) {
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = (img.width || 800) * scale;
      canvas.height = (img.height || 1100) * scale;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(url);

      canvas.toBlob(function (blob) {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(pngUrl);
        }, 100);
      }, 'image/png');
    };

    img.src = url;
  }

  /**
   * Exports SVG string as downloadable .svg file
   * @param {string} svgString
   * @param {string} filename
   */
  function exportToSVG(svgString, filename = 'puzzle.svg') {
    downloadBlob(svgString, filename, 'image/svg+xml;charset=utf-8');
  }

  /**
   * Exports SVG as PDF printable document using jsPDF
   * @param {string} svgString
   * @param {string} filename
   */
  function exportToPDF(svgString, filename = 'puzzle.pdf') {
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = (img.width || 800) * 2;
      canvas.height = (img.height || 1100) * 2;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(url);

      const imgData = canvas.toDataURL('image/png');

      if (window.jspdf && window.jspdf.jsPDF) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(filename);
      } else {
        // Fallback print mode if jsPDF not available
        const win = window.open('', '_blank');
        win.document.write(`<html><head><title>${filename}</title></head><body style="margin:0;"><img src="${imgData}" style="width:100%;height:auto;"/></body></html>`);
        win.document.close();
        win.print();
      }
    };

    img.src = url;
  }

  /**
   * Saves current puzzle project options and raw input as JSON file
   * @param {Object} projectData
   * @param {string} filename
   */
  function exportProjectJSON(projectData, filename = 'puzzle-project.json') {
    const jsonStr = JSON.stringify(projectData, null, 2);
    downloadBlob(jsonStr, filename, 'application/json');
  }

  exports.exportToPNG = exportToPNG;
  exports.exportToSVG = exportToSVG;
  exports.exportToPDF = exportToPDF;
  exports.exportProjectJSON = exportProjectJSON;
  exports.downloadBlob = downloadBlob;
})(typeof module !== 'undefined' && module.exports ? module.exports : (window.Exporter = {}));
