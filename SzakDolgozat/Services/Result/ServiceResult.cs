using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Result
{
    public class ServiceResult<T>
    {
        public T? Data { get; set; }
        public bool IsSuccess { get;  }
        public string? Message { get; set; } = string.Empty;
        private ServiceResult(T? data, string? message = null)
        {
            Data = data;
            IsSuccess = true;
            Message = message ?? "Operation successful";
        }
        private ServiceResult(string errorMessage)
        {
            Message = errorMessage;
            IsSuccess = false;
        }

        public static ServiceResult<T> Success(T? data, string? successMessage) => new ServiceResult<T>(data, successMessage);
        public static ServiceResult<T> Failure(string errorMessage) => new ServiceResult<T>(errorMessage);
    }
}
