import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { MatTableModule } from "@angular/material/table";
import { RouterLink } from '@angular/router';
import { Zone } from '@repo/angular-sdk';
import { SCNGXUiTitleModule } from '@repo/angular-ui';
import { tableDatasource, TableDataSourceItem } from 'src/api/datasource/tableDatasource';
import { ApiZoneService } from 'src/api/zones';
import { ScPaginator } from 'src/app/components/v2/paginator/api/paginator';
import { ScPaginatorComponent } from 'src/app/components/v2/paginator/components/paginator/paginator.component';
import { ZoneListItemComponent } from '../../components/zone-list-item/zone-list-item.component';

@Component({
  selector: 'app-view-zones-list',
  templateUrl: './zones-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZoneListItemComponent, ScrollingModule, RouterLink, SCNGXUiTitleModule, MatTableModule, ScPaginatorComponent],
})
export class ZonesListViewComponent {
  private readonly _service = inject(ApiZoneService);

  private readonly _paginator = viewChild(ScPaginator);

  protected readonly dataSource = tableDatasource({
    paginator: this._paginator,
    request: (pageable) => this._service.findZones(pageable)
  });

  protected asItem(item: TableDataSourceItem<Zone>) {
    return item;
  }
}
