import { AbstractAppPaginator } from '@writetome51/abstract-app-paginator';
import { ArrayPaginator } from '@writetome51/array-paginator';
import { PaginationPageInfo } from '@writetome51/pagination-page-info';
import { PaginationBatchInfo } from '@writetome51/pagination-batch-info';
import { GetPageBatch } from '@writetome51/batch-loader';
import { PageLoader } from '@writetome51/page-loader';
import { BatchToPageTranslator } from '@writetome51/batch-to-page-translator';


/***************************
 AppPaginator is intended for a real-world web application.  It automatically
 batchinates the full dataset in case it's huge.
 ***************************/

export class AppPaginator extends AbstractAppPaginator {


	constructor(
		dataSource: {

			// The number of items `getBatch()` returns must match `itemsPerBatch`.  If
			// `isLastBatch` is true, it must only return the remaining items in the dataset
			// and ignore itemsPerBatch.

			getBatch: (batchNumber: number, itemsPerBatch: number, isLastBatch: boolean) => any[];

			// `dataTotal`: number of items in entire dataset, not the batch.
			// This must stay accurate after actions that change the total, such as searches.

			dataTotal: number;
		}
	) {
		super(
			dataSource,

			function (dataSource): void {

				let batchPaginator: {
					currentPage: any[], currentPageNumber: number, itemsPerPage: number, data: any[]
				} = new ArrayPaginator();

				this.__pageInfo = new PaginationPageInfo(dataSource, batchPaginator);
				this.__batchInfo = new PaginationBatchInfo(this.__pageInfo);

				let bch2pgTranslator = new BatchToPageTranslator(this.__pageInfo, this.__batchInfo);

				let getPageBatch: {
					containingPage: (pageNumber) => any[], byForce_containingPage: (pageNumber) => any[]
				} = new GetPageBatch(
					dataSource, this.__batchInfo, bch2pgTranslator
				);

				this.__pageLoader = new PageLoader(
					batchPaginator, bch2pgTranslator, getPageBatch
				);

			}
		);
	}


}
