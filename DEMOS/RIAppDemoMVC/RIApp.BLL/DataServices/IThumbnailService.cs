﻿using RIAppDemo.BLL.Utils;
using System;
using System.IO;
using System.Threading.Tasks;

namespace RIAppDemo.BLL.DataServices
{
    public interface IThumbnailService : IDisposable
    {
        Task<string> GetThumbnail(int id, Stream strm);
        Task SaveThumbnail(int id, string fileName, Stream strm);
        Task SaveThumbnail2(int id, string fileName, IDataContent content);
    }
}