/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 47.703429907050065, "KoPercent": 52.296570092949935};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.10091319236832093, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.31862745098039214, 500, 1500, "API Request from myABConnect-2"], "isController": false}, {"data": [0.06565656565656566, 500, 1500, "API Request from myABStream-0"], "isController": false}, {"data": [0.0044444444444444444, 500, 1500, "API Request from myABConnect-1"], "isController": false}, {"data": [0.45555555555555555, 500, 1500, "API Request from myABConnect-0"], "isController": false}, {"data": [0.2081875, 500, 1500, "API request from Juakali"], "isController": false}, {"data": [5.379814934366257E-4, 500, 1500, "API Request from myABStream"], "isController": false}, {"data": [1.0E-4, 500, 1500, "API Request from myABConnect"], "isController": false}, {"data": [0.4595959595959596, 500, 1500, "API Request from myABStream-1"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 18397, 9621, 52.296570092949935, 4323.89405881393, 8, 15668, 3430.0, 9274.400000000001, 10645.499999999993, 14705.02, 70.17845017661914, 128.1079375555511, 3.9684991259641573], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["API Request from myABConnect-2", 102, 12, 11.764705882352942, 1355.0882352941176, 276, 5937, 1065.5, 2375.4, 2940.3999999999996, 5852.879999999997, 6.688524590163935, 47.43826844262295, 0.899077868852459], "isController": false}, {"data": ["API Request from myABStream-0", 99, 0, 0.0, 4807.363636363637, 237, 12392, 3784.0, 10553.0, 10952.0, 12392.0, 6.885998469778118, 4.478588848508034, 0.7935037299158377], "isController": false}, {"data": ["API Request from myABConnect-1", 225, 123, 54.666666666666664, 4937.822222222224, 8, 15247, 4188.0, 11587.0, 12312.9, 15042.580000000002, 14.253135689851767, 33.05533532481313, 0.8202976529836564], "isController": false}, {"data": ["API Request from myABConnect-0", 225, 0, 0.0, 6620.506666666667, 29, 15452, 7953.0, 14893.4, 14983.0, 15050.78, 14.440664912393299, 6.557528500256723, 1.5935499366215262], "isController": false}, {"data": ["API request from Juakali", 8000, 0, 0.0, 2830.073874999998, 22, 12076, 2634.0, 5440.800000000001, 6001.0, 7053.99, 30.51734529613269, 28.31199026496685, 3.397438831796022], "isController": false}, {"data": ["API Request from myABStream", 4647, 4562, 98.17086292231548, 7170.236496664504, 21, 13166, 7228.0, 10642.599999999999, 11156.8, 12039.719999999994, 308.7502491528802, 710.34251773138, 1.5521445834163843], "isController": false}, {"data": ["API Request from myABConnect", 5000, 4910, 98.2, 4053.6970000000006, 821, 15668, 2174.0, 9600.900000000001, 13073.649999999932, 15137.909999999998, 315.21876182070355, 847.3934240440991, 3.2460760189446476], "isController": false}, {"data": ["API Request from myABStream-1", 99, 14, 14.141414141414142, 1037.7979797979797, 112, 3907, 774.0, 2395.0, 3562.0, 3907.0, 6.7250866109639285, 41.88452083757897, 0.8119777868351334], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 2, 0.02078785988982434, 0.010871337718106213], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 5061, 52.6036794512005, 27.509920095667773], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 10.200.0.10:80 [/10.200.0.10] failed: Connection timed out: connect", 217, 2.255482798045941, 1.1795401424145242], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 10.200.0.10:80 [/10.200.0.10] failed: Connection refused: connect", 4341, 45.12004989086373, 23.596238517149537], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 18397, 9621, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 5061, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 10.200.0.10:80 [/10.200.0.10] failed: Connection refused: connect", 4341, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 10.200.0.10:80 [/10.200.0.10] failed: Connection timed out: connect", 217, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 2, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["API Request from myABConnect-2", 102, 12, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 12, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["API Request from myABConnect-1", 225, 123, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 123, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["API Request from myABStream", 4647, 4562, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 4561, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["API Request from myABConnect", 5000, 4910, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 10.200.0.10:80 [/10.200.0.10] failed: Connection refused: connect", 4341, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 352, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 10.200.0.10:80 [/10.200.0.10] failed: Connection timed out: connect", 217, "", "", "", ""], "isController": false}, {"data": ["API Request from myABStream-1", 99, 14, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Socket closed", 13, "Non HTTP response code: java.io.InterruptedIOException/Non HTTP response message: Connection has been shut down", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
