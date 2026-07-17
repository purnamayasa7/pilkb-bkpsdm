// window.addEventListener('DOMContentLoaded', event => {
//     // Simple-DataTables
//     // https://github.com/fiduswriter/Simple-DataTables/wiki

//     const datatablesSimple = document.getElementById('datatablesSimple');
//     if (datatablesSimple) {
//         new simpleDatatables.DataTable(datatablesSimple);
//     }
// });

// window.addEventListener('DOMContentLoaded', () => {

//     const table =
//         document.getElementById('datatablesSimple');

//     if (table) {

//         window.dataTable =
//             new simpleDatatables.DataTable(table);

//     }

// });

window.addEventListener('DOMContentLoaded', () => {

    const table = document.getElementById('datatablesSimple');

    if (!table) return;

    window.dataTable = new simpleDatatables.DataTable(table);

    requestAnimationFrame(() => {

        const loading = document.getElementById('tableLoading');

        if (loading) {
            loading.classList.add('hide');
        }

    });

});