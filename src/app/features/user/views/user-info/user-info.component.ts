import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { User } from '../../entities/user.entity';
import { UserService } from '../../services/user.service';

@Component({
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit, OnDestroy {

  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService
  ) { }

  public userId: string;
  public user: User;

  public ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(takeUntil(this.$destroy)).subscribe((paramMap) => {
      this.userId = paramMap.get("userId");

      this.userService.findProfileById(this.userId).then((user) => {
        this.user = user;
      })
    })
  }

  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

}
