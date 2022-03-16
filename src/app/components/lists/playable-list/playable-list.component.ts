import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { Song } from 'src/app/features/song/entities/song.entity';
import { AudioService } from 'src/app/features/stream/services/audio.service';
import { PlayableList } from 'src/lib/data/playable-list.entity';
import audio_wave_anim from "src/assets/animated/audio_wave.json"
import { ScrollService } from 'src/app/services/scroll.service';
import { Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'asc-playable-list',
  templateUrl: './playable-list.component.html',
  styleUrls: ['./playable-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayableListComponent implements OnInit, OnDestroy {

  constructor(
    private scrollService: ScrollService,
    public audioService: AudioService
  ) { }

  @Input() public list: PlayableList<any>;
  @Input() public showCover: boolean = true;
  @Input() public showAlbum: boolean = true;
  @Input() public showDate: boolean = true;
  @Input() public showCount: boolean = true;

  // Destroy subscriptions
  private _destroySubject: Subject<void> = new Subject();
  private $destroy: Observable<void> = this._destroySubject.asObservable();

  public animOptions: AnimationOptions = {
    autoplay: true,
    loop: true,
    animationData: audio_wave_anim
  }

  public ngOnInit(): void {
    this.scrollService.$onBottomReached.pipe(takeUntil(this.$destroy)).subscribe(() => {
      this.list.fetchNextPage();
    })
  }

  public ngOnDestroy(): void {
      this._destroySubject.next();
      this._destroySubject.complete();
  }

  public async playOrPause(song: Song) {
    this.audioService.playOrPause(song);
  }

}
